import {
  collection,
  documentId,
  type FieldPath,
  getDocs,
  type QueryDocumentSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "./firebase.ts";

const QUERY_VALUE_LIMIT = 30;

export async function getBulkDocuments(
  spaceId: string,
  sub: string,
  ids: string[],
  field: string | FieldPath = documentId()
) {
  const documents: QueryDocumentSnapshot[] = [];
  const uniqueIds = [...new Set(ids)];
  for (let offset = 0; offset < uniqueIds.length; offset += QUERY_VALUE_LIMIT) {
    const values = uniqueIds.slice(offset, offset + QUERY_VALUE_LIMIT);
    const snapshot = await getDocs(query(collection(firestore, "spaces", spaceId, sub), where(field, "in", values)));
    documents.push(...snapshot.docs);
  }
  return documents;
}
