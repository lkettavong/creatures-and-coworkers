import { UnionType } from "./unionHelpers";
import { Direction } from "./dungeonState";

export const makeFactory = <T extends UnionType>(kind: T['kind']) => (init: Partial<T>): T => ({
  ...init,
  kind
} as T);

export type CommonEvent = {
  playerId: number;
};

export type Move = {
  kind: 'move';
  direction: Direction;
} & CommonEvent;

export const Move = makeFactory<Move>('move');

export type PickUp = {
  kind: 'pick-up';
  itemId: number;
} & CommonEvent;

export const PickUp = makeFactory<PickUp>('pick-up');

export type Stab = {
  kind: 'stab';
} & CommonEvent;

export const Stab = makeFactory<Stab>('stab');

export type DropInToDungeon = {
  kind: 'drop-in';
  dungeonId: string;
} & CommonEvent;

export const DropInToDungeon = makeFactory<DropInToDungeon>('drop-in');

export type DungeonEvent = Move | PickUp | Stab | DropInToDungeon;