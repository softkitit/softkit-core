type ExtractArrayMembers<T extends readonly unknown[]> =
  T extends readonly (infer MemberType)[] ? MemberType : never;

export type OmittedEntity<
  TEntity,
  TExclude extends readonly (keyof TEntity)[],
> = Omit<TEntity, ExtractArrayMembers<TExclude>>;
