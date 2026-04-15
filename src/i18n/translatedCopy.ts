import i18next from "i18next";

export function translatedCopy<T extends object>(prefix: string): T {
  return new Proxy({} as T, {
    get: (_, key: string) => i18next.t(`${prefix}.${key}`),
  }) as T;
}
