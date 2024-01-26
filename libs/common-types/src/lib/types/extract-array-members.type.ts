export type ExtractArrayMembers<T> = T extends readonly (infer MemberType)[]
  ? MemberType
  : T extends string | number | symbol
  ? T
  : never;
