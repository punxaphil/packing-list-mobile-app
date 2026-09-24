const BUILD_ASSETS = 'script[type="module"][src], link[rel="stylesheet"][href]';
const REFRESH_PARAM = "appVersion";
const EDITABLE_FIELDS = "input, textarea, select, [contenteditable]";

const buildVersion = (page: Document) =>
  Array.from(page.querySelectorAll(BUILD_ASSETS), (asset) => asset.getAttribute("src") ?? asset.getAttribute("href"))
    .filter(Boolean)
    .join("|");

const isEditing = () => document.activeElement?.matches(EDITABLE_FIELDS) ?? false;

async function latestBuildVersion() {
  const response = await fetch("/index.html", { cache: "no-store" });
  if (!response.ok) return null;
  return buildVersion(new DOMParser().parseFromString(await response.text(), "text/html"));
}

function reloadWithVersion(version: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(REFRESH_PARAM, version);
  window.location.replace(url.href);
}

async function checkForUpdate() {
  if (document.visibilityState !== "visible" || isEditing()) return;
  const currentVersion = buildVersion(document);
  if (!currentVersion) return;
  try {
    const nextVersion = await latestBuildVersion();
    if (nextVersion && nextVersion !== currentVersion && !isEditing()) reloadWithVersion(nextVersion);
  } catch {
    return;
  }
}

export function watchForWebUpdates() {
  window.addEventListener("pageshow", checkForUpdate);
  document.addEventListener("visibilitychange", checkForUpdate);
}
