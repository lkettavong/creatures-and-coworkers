import * as R from 'ramda';

type Optional<T> = T | undefined;

export const lensFind = <T>(pred: (_: T) => boolean): R.Lens => R.lens<T[], Optional<T>, T[]>(
  R.find(pred),
  (toSetWith: T, arr) => {
    const idx = R.findIndex(pred)(arr);

    return R.set(R.lensIndex(idx), toSetWith, arr);
  }
);


export const lensCompose = (...lenses: R.Lens[]): R.Lens => {
  if (lenses.length > 6) {
    throw new Error("Cannot compose more than 6 lenses");
  }

  return (
    lenses.length === 6 ? R.compose(lenses[0], lenses[1], lenses[2], lenses[3], lenses[4], lenses[5]) :
    lenses.length === 5 ? R.compose(lenses[0], lenses[1], lenses[2], lenses[3], lenses[4]) :
    lenses.length === 4 ? R.compose(lenses[0], lenses[1], lenses[2], lenses[3]) :
    lenses.length === 3 ? R.compose(lenses[0], lenses[1], lenses[2]) :
    lenses.length === 2 ? R.compose(lenses[0], lenses[1]) :
    lenses[0]
  ) as R.Lens;
};

export const lensFilter = <T>(pred: (_: T) => boolean): R.Lens => R.lens<T[], T[], T[]>(
  R.filter(pred),
  (toSetWith: T[], arr) => {
    let i = 0;
    return R.map<T, T>(d => {
      return pred(d) ? toSetWith[i++] : d;
    })(arr);
  }
);