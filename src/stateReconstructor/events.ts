import { UnionType, makeFactory } from "./unionHelpers";
import { Direction } from "./dungeonState";

export type CommonEvent = {
  playerId: string;
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

export type Look = {
  kind: 'look';
} & CommonEvent;

export const Look = makeFactory<Look>('look');

export const DropInToDungeon = makeFactory<DropInToDungeon>('drop-in');

export type DungeonEvent = Move | PickUp | Stab | DropInToDungeon | Look;