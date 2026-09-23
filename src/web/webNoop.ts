/**
 * No-op implementations for native-only APIs on web.
 * Import from these files when targeting web-specific implementations.
 */

export const noopAsync = async () => {};

export const noopVoid = () => {};

export const noopPromise = <T>() => Promise.resolve<T>(undefined as unknown as T);

export const noopTrue = () => true;

export const noopFalse = () => false;
