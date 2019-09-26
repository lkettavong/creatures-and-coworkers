import * as R from 'ramda';

import { match, makeFactory } from "./unionHelpers";
import { Direction, DungeonState, Room, Player } from "./dungeonState";
import { DungeonEvent, Move, DropInToDungeon } from './events';
import { lenses } from './lenses';

import testDungeonJson from './testDungeon.json';
import { lensCompose, lensFind } from '../util/lens';
const testDungeon = DungeonState(testDungeonJson);

/*
  Need further investigation to determine if mergeStates can be made more efficient.
  - Can we compose the lenses/transforms first before giving it state?
  - What else besides lenses are equally cool but more friendly?
  - R.applySpec might be happy medium
*/
type DungeonTransformer = (_: DungeonState) => DungeonState;
const mergeStates = (...transforms: DungeonTransformer[]) => (state: DungeonState): DungeonState => (
  transforms.length > 1
    ? R.reduce<DungeonTransformer, DungeonState>((accState, t) => (
        R.mergeDeepRight(accState, t(accState)) as DungeonState
      ), state, transforms)
    : transforms[0](state)
);

type ReductionResult = Unable | NextState;

type NextState = {
  kind: 'nextState';
  nextState: DungeonState;
};

type Unable = {
  kind: 'unable';
  lastState: DungeonState;
};

const NextState = makeFactory<NextState>('nextState');
const Unable = makeFactory<Unable>('unable');


export const reduceState = (state: DungeonState) => match<DungeonEvent, DungeonState>({
  'move': ({direction, playerId}) => {
    const currentRoomName: string = R.view(lenses.playerRoom(playerId), state);
    const currentRoom: Room = R.view(lenses.room(currentRoomName), state);

    const nextRoomName = currentRoom[direction];
    const nextRoom: Room = R.view(lenses.room(nextRoomName), state);

    if (!nextRoom) {
      return state;
    }

    return R.set(
      lenses.playerRoom(playerId),
      nextRoomName,
      state
    );
  },
  'pick-up': ({itemId, playerId}) => {
    return R.over(
      lenses.playerInventory(playerId),
      (inventory: string[]) => [...inventory, itemId],
      state
    );
  },
  'stab': ({playerId}) => {
    return R.over(
      lenses.deadPlayers(),
      (deadPlayers: number[]) => [...deadPlayers, playerId],
      state
    )
  },
  'drop-in': ({playerId}) => {
    const player: Room = R.view(
      lenses.player(playerId),
      state
    );

    const startingRoom: Room = R.view(
      lenses.firstRoom(),
      state
    );

    return !!player
      ? state
      : R.over(
          lenses.players(),
          (players: Player[]) => [...players, {
            id: playerId,
            gold: 0,
            room: startingRoom.roomName,
            inventory: []
          }],
          state
        );
  }
});


export const go = () => {

  type D = {a: number};
  const data = [{a: 1},{a: 2},{a: 3},{a: 4},{a: 5}];

  // compose<V0, T1, T2>(fn1: (x: T1) => T2, fn0: (x0: V0) => T1): (x0: V0) => T2;

  const lens = lensCompose(
    lensFind<D>(R.whereEq({a: 3})),
    R.lensPath(['a'])
  );

  console.log(R.view(lens, data));
  const l = R.over(lens, n => n + 5, data);

  console.log('testing lens');
  console.log(l);

  // console.log(testDungeon);

  // console.log('testing lens');
  // console.log(JSON.stringify(reduceState(testDungeon)(DropInToDungeon({playerId: '1', dungeonId: 'the-dungeon'})), null, 4));
};
