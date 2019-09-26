import * as R from 'ramda';

export const lensFind = <T>(pred: (_: T) => boolean): R.Lens => R.lens<T[], T, T[]>(
  R.find(pred),
  (toSetWith: T, arr) => {
    const idx = R.findIndex(pred)(arr);
    return R.set(R.lensIndex(idx), toSetWith, arr);
  }
);

export const lensCompose = (lens0: R.Lens, lens1?: R.Lens, lens2?: R.Lens,
                     lens3?: R.Lens, lens4?: R.Lens, lens5?: R.Lens) => (
  lens5 ? R.compose(lens0, lens1, lens2, lens3, lens4, lens5) :
  lens4 ? R.compose(lens0, lens1, lens2, lens3, lens4) :
  lens3 ? R.compose(lens0, lens1, lens2, lens3) :
  lens2 ? R.compose(lens0, lens1, lens2) :
  lens1 ? R.compose(lens0, lens1) :
  lens0
) as R.Lens;