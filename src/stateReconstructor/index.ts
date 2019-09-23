import * as R from 'ramda';
const L = require('partial.lenses');

import { match } from "./unionHelpers";
import { Direction, DungeonState, Room } from "./dungeonState";
import { DungeonEvent, Move, DropInToDungeon } from './events';

import testDungeonJson from './testDungeon.json';
const testDungeon = DungeonState(testDungeonJson);

const lenses = {
  player: (playerId: number): R.Lens => L.compose(
    L.prop('players'),
    L.find(R.whereEq({id: playerId}))
  ),
  room: (roomName: string): R.Lens => L.compose(
    L.prop('rooms'),
    L.find(R.whereEq({roomName}))
  ),
  deadPlayers: (): R.Lens => L.prop('deadPlayers'),
  firstRoom: (): R.Lens => L.compose(
    L.prop('rooms'),
    L.first
  ),
  playerRoom: (playerId: number): R.Lens => L.compose(
    lenses.player(playerId),
    L.prop('room')
  ),
  playerInventory: (playerId: number): R.Lens => L.compose(
    lenses.player(playerId),
    L.prop('inventory')
  ),
  playerGold: (playerId: number): R.Lens => L.compose(
    lenses.player(playerId),
    L.prop('gold')
  )
};

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

export const reduceState = (state: DungeonState) => match<DungeonEvent, DungeonState>({
  'move': ({direction, playerId}: {direction: Direction, playerId: number}) => {
    const currentRoom: string = L.get(lenses.playerRoom(playerId), state);
    const nextRoom: Room = L.get(lenses.room(currentRoom), state);
    const nextRoomName = nextRoom[direction];

    return L.set(
      lenses.playerRoom(playerId),
      nextRoomName,
      state
    );
  },
  'pick-up': ({itemId, playerId}) => {
    return L.modify(
      lenses.playerInventory(playerId),
      (inventory: string[]) => [...inventory, itemId],
      state
    );
  },
  'stab': ({playerId}) => {
    return L.modify(
      lenses.deadPlayers,
      (deadPlayers: number[]) => [...deadPlayers, playerId],
      state
    )
  },
  'drop-in': ({playerId}) => {
    const startingRoom: Room = L.get(
      lenses.firstRoom(),
      state
    );

    return mergeStates(
      L.set(lenses.playerRoom(playerId)     , startingRoom),
      L.set(lenses.playerInventory(playerId), []),
      L.set(lenses.playerGold(playerId)     , 0)
    )(state);
  }
});


export const go = () => {
  console.log(testDungeon);

  // console.log(L.get(playerLens, testDungeon));

  console.log('testing lens');
  console.log(JSON.stringify(reduceState(testDungeon)(DropInToDungeon({playerId: 1, dungeonId: 'the-dungeon'})), null, 4));
};
