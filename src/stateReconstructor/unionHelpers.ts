export type UnionType = {kind: string};

export type UnionMemberByKind<U, K> = Extract<U, { kind: K }>

export type UnionMatchObj<U extends UnionType, Ret> = {
  [K in U['kind']]: (unionMember: UnionMemberByKind<U, K>) => Ret
};

export const match = <U extends UnionType, RetT>(
  fObj: UnionMatchObj<U, RetT>
) => (
  unionVal: U
) => (
  fObj[unionVal.kind as U['kind']](unionVal as any)
);

export const makeFactory = <T extends UnionType>(kind: T['kind']) => (init: Partial<T>): T => ({
  ...init,
  kind
} as T);
