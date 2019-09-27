import * as R from 'ramda';

type RecordJoinF<R1, R2> = (a: R1, b: R2) => R1;

export const gatherJoin =
  <RetT extends {}, T extends Record<string, any>>(onProp: string, addJoinedRecords: (a: RetT, b: T) => RetT) =>
    (join: T[]) => {
      return R.pipe(
        R.groupBy((elem: T) => elem[onProp]),
        R.mapObjIndexed(R.reduce(addJoinedRecords, {} as RetT)),
        R.values
      )(join);
    };

export const dissolveJoin =
  <FromT, ToT1, ToT2>(mapper: (from: FromT) => [ToT1[], ToT2[]]) =>
    (joinedArr: FromT[]): [ToT1[], ToT2[]] => {
      const x = R.map(mapper, joinedArr)
      return R.pipe(
        R.map(mapper),
        R.reduce((acc, elem): [ToT1[], ToT2[]] => {
          return [
            [
              ...acc[0],
              ...elem[0]
            ],
            [
              ...acc[1],
              ...elem[1]
            ]
          ];
        }, [[], []] as [ToT1[], ToT2[]])
      )(joinedArr);
    };
