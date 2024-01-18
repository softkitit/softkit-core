export type Never<T> = {
  [K in keyof T]: never;
};
