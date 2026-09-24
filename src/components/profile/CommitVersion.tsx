import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { homeColors } from "../home/theme.ts";
import { profileCopy } from "./profileCopy.ts";

declare const __COMMIT_SHA__: string;

const COMMIT_PATH = "/__commit";
const SHA_PATTERN = /^[a-f0-9]{7,40}$/;

export const CommitVersion = () => {
  const [checkoutSha, setCheckoutSha] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
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
    <View style={styles.version}>
      <Text style={styles.text}>
        {profileCopy.commit}: {checkoutSha ?? __COMMIT_SHA__}
      </Text>
      {checkoutSha && checkoutSha !== __COMMIT_SHA__ && (
        <Text style={styles.text}>
          {profileCopy.runningBuild}: {__COMMIT_SHA__}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  version: { alignItems: "center" },
  text: { fontSize: 12, color: homeColors.muted },
});
