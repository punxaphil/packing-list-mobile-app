const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const apply = process.argv.includes("--apply");
const BATCH_LIMIT = 450;

const normalizeImageType = (type) => String(type || "").toLowerCase();
const getMemberId = (member) => (typeof member === "string" ? member : (member?.id ?? member?.memberId));
const sameMembers = (left, right) =>
  left.length === right.length &&
  left.every((member, index) => member.id === right[index]?.id && member.checked === right[index]?.checked);
const normalizeMembers = (members, memberIds, checked) =>
  Array.isArray(members)
    ? members.flatMap((member) => {
        const id = getMemberId(member);
        if (!id || !memberIds.has(id)) return [];
        return [{ id, checked: typeof member === "string" ? checked : !!member.checked }];
      })
    : null;

const resolveImageTarget = (image, refs) => {
  const type = normalizeImageType(image.type);
  if (type === "profile") return true;
  if (["packinglist", "packinglists"].includes(type)) return refs.packingListIds.has(image.typeId);
  if (["category", "categories"].includes(type)) return refs.categoryIds.has(image.typeId);
  if (["member", "members"].includes(type)) return refs.memberIds.has(image.typeId);
  if (["packitem", "packitems"].includes(type)) return refs.packItemIds.has(image.typeId);
  return false;
};

async function fixSpace(spaceDoc) {
  const name = spaceDoc.data().name || "Unknown";
  const [packingListsSnap, packItemsSnap, categoriesSnap, membersSnap, imagesSnap] = await Promise.all([
    spaceDoc.ref.collection("packingLists").get(),
    spaceDoc.ref.collection("packItems").get(),
    spaceDoc.ref.collection("categories").get(),
    spaceDoc.ref.collection("members").get(),
    spaceDoc.ref.collection("images").get(),
  ]);
  const packingListIds = new Set(packingListsSnap.docs.map((doc) => doc.id));
  const categoryIds = new Set(categoriesSnap.docs.map((doc) => doc.id));
  const memberIds = new Set(membersSnap.docs.map((doc) => doc.id));
  const packItemIds = new Set(packItemsSnap.docs.map((doc) => doc.id));
  const refs = { packingListIds, categoryIds, memberIds, packItemIds };
  const fixes = { deletedPackItems: 0, updatedPackItems: 0, deletedImages: 0 };
  let batch = db.batch();
  let writes = 0;
  const flush = async () => {
    if (!apply || !writes) return;
    await batch.commit();
    batch = db.batch();
    writes = 0;
  };
  const queueDelete = async (ref) => {
    batch.delete(ref);
    writes++;
    if (writes >= BATCH_LIMIT) await flush();
  };
  const queueUpdate = async (ref, next) => {
    batch.update(ref, next);
    writes++;
    if (writes >= BATCH_LIMIT) await flush();
  };

  for (const doc of packItemsSnap.docs) {
    const item = doc.data();
    const packingList = item.packingList;
    if (!packingList || !packingListIds.has(packingList)) {
      await queueDelete(doc.ref);
      fixes.deletedPackItems++;
      continue;
    }
    const next = {};
    let changed = false;
    if (item.category && !categoryIds.has(item.category)) {
      next.category = "";
      changed = true;
    }
    const members = normalizeMembers(item.members, memberIds, !!item.checked);
    if (members && !sameMembers(members, item.members)) {
      next.members = members;
      next.checked = members.length > 0 && members.every((member) => member.checked);
      changed = true;
    }
    if (!changed) continue;
    await queueUpdate(doc.ref, next);
    fixes.updatedPackItems++;
  }

  for (const doc of imagesSnap.docs) {
    if (resolveImageTarget(doc.data(), refs)) continue;
    await queueDelete(doc.ref);
    fixes.deletedImages++;
  }

  await flush();

  if (fixes.deletedPackItems || fixes.updatedPackItems || fixes.deletedImages) {
    console.log(`${apply ? "FIXED" : "WOULD FIX"} ${name} (${spaceDoc.id})`, fixes);
  }
  return fixes;
}

async function main() {
  const spacesSnap = await db.collection("spaces").get();
  const totals = { deletedPackItems: 0, updatedPackItems: 0, deletedImages: 0 };
  for (const spaceDoc of spacesSnap.docs) {
    const fixes = await fixSpace(spaceDoc);
    totals.deletedPackItems += fixes.deletedPackItems;
    totals.updatedPackItems += fixes.updatedPackItems;
    totals.deletedImages += fixes.deletedImages;
  }
  console.log(`${apply ? "APPLIED" : "DRY RUN"} TOTALS`, totals);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
