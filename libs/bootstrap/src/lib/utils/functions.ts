export function callOrUndefinedIfException<T>(f: () => T) {
  try {
    return f();
  } catch (error) {
    return error;
  }
}
