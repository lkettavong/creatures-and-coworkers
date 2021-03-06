export type UnionType = {kind: string};

export type UnionMemberByKind<U, K> = Extract<U, { kind: K }>

export type UnionMatchObj<U extends UnionType, Ret> = {
  [K in U['kind']]: (unionMember: UnionMemberByKind<U, K>) => Ret
};

export type Merge<M extends {}, N extends {}> = {
  [P in Exclude<keyof M, keyof N>]: M[P]
} & N;