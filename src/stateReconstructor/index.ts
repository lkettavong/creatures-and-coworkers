import * as R from 'ramda';
const L = require('partial.lenses');

import { match } from "./unionHelpers";
import { Direction, DungeonState, Room } from "./dungeonState";
import { DungeonEvent, Move } from './events';

import testDungeonJson from './testDungeon.json';
const testDungeon = DungeonState(testDungeonJson);

const playerLens = (playerId: number): R.Lens => L.compose(
  L.prop('players'),
  L.find(R.whereEq({id: playerId}))
);

const playerRoom = (playerId: number): R.Lens => L.compose(
  playerLens(playerId),
  L.prop('room')
);

const playerInventory = (playerId: number): R.Lens => L.compose(
  playerLens(playerId),
  L.prop('inventory')
);

const roomLens = (roomName: string): R.Lens => L.compose(
  L.prop('rooms'),
  L.find(R.whereEq({roomName}))
);

export const reduceState = (state: DungeonState) => match<DungeonEvent, DungeonState>({
  'move': ({direction, playerId}: {direction: Direction, playerId: number}) => {
    const currentRoom: string = L.get(playerRoom(playerId), state);
    const nextRoom: Room = L.get(roomLens(currentRoom), state);
    const nextRoomName = nextRoom[direction];

    return L.set(
      playerRoom(playerId),
      nextRoomName,
      state
    );
  },
  'pick-up': ({itemId, playerId}) => {
    return L.modify(
      playerInventory(playerId),
      (inventory: string[]) => [...inventory, itemId],
      state
    );
  },
  'stab': ({playerId}) => {
    return L.modify(
      L.prop('deadPlayers'),
      (deadPlayers: number[]) => [...deadPlayers, playerId],
      state
    )
  }
});


export const go = () => {
  console.log(testDungeon);

  console.log(L.get(playerLens, testDungeon));

  console.log(reduceState(testDungeon)(Move({playerId: 1, direction: 'east'})));
};
