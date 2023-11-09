import { ExtractArrayMembers } from './extract-array-members.type';

type KeysOrListOfKeys<T> = keyof T | readonly (keyof T)[];

export type ExcludeKeys<
  TObject,
  TKeys extends KeysOrListOfKeys<TObject>,
> = Omit<TObject, ExtractArrayMembers<TKeys>>;
