import { useEffect, useState } from "react";
import { homeColors } from "../home/theme.ts";
import { profileCopy } from "./profileCopy.ts";

declare const __COMMIT_SHA__: string;

const COMMIT_PATH = "/__commit";
const SHA_PATTERN = /^[a-f0-9]{7,40}$/;
const VERSION_FONT_SIZE = 12;

export const CommitVersion = () => {
  const [checkoutSha, setCheckoutSha] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(COMMIT_PATH, { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : null))
      .then((value) => {
        const sha = value?.trim();
        if (active && sha && SHA_PATTERN.test(sha)) setCheckoutSha(sha);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ textAlign: "center", fontSize: VERSION_FONT_SIZE, color: homeColors.muted }}>
      <div>
        {profileCopy.commit}: {checkoutSha ?? __COMMIT_SHA__}
      </div>
      {checkoutSha && checkoutSha !== __COMMIT_SHA__ && (
        <div>
          {profileCopy.runningBuild}: {__COMMIT_SHA__}
        </div>
      )}
    </div>
  );
};
