import i18next from "i18next";

export const getLoadingMessages = (): readonly string[] => i18next.t("loading", { returnObjects: true }) as string[];
