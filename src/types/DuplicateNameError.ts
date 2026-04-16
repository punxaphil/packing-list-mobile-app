export class DuplicateNameError extends Error {
  constructor(name: string) {
    super(`"${name}" already exists`);
  }
}
