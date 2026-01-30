declare module "react-lifecycles-compat" {
  export function polyfill<T>(component: T): T;
}

declare module "src/adapters/UniqueIdProvider" {
  export class UniqueIdProvider {
    generate(prefix?: string): string;
  }
}

declare module "src/interfaces/Options" {
  export interface AnimationOptions {
    [key: string]: unknown;
  }
  export interface ViewAnimationOptions {
    [key: string]: unknown;
  }
}
