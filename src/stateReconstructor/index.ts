import * as R from 'ramda';

import { match, makeFactory } from "./unionHelpers";
import { Direction, DungeonState, Room, Player } from "./dungeonState";
import { DungeonEvent, Move, DropInToDungeon } from './events';
import { lenses } from './lenses';

import testDungeonJson from './testDungeon.json';
import { lensCompose, lensFind, lensFilter } from '../util/lens';
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


export const reduceState = (state: DungeonState, evt: DungeonEvent) => (
  match<DungeonEvent, DungeonState>({
    'move': ({direction, playerId}) => {
      const currentRoomName: string = R.view(lenses.playerRoomName(playerId), state);
      const currentRoom: Room = R.view(lenses.room(currentRoomName), state);

      const nextRoomName = currentRoom[direction];
      const nextRoom: Room = R.view(lenses.room(nextRoomName), state);

      if (!nextRoom) {
        return state;
      }

      return R.set(
        lenses.playerRoomName(playerId),
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
      const currentRoomName: string = R.view(lenses.playerRoomName(playerId), state);

      const playersInRoom: Player[] = R.view(lensCompose(
        lenses.players(),
        lensFilter((p: Player) => p.room === currentRoomName)
      ), state);

      const newlyDeadPlayers = playersInRoom
        .filter(p => p.id !== playerId);

      const addToDeadPlayers = R.over(
        lenses.deadPlayers(),
        R.concat(newlyDeadPlayers)
      );
      const removeFromPlayers = R.over(
        lenses.players(),
        R.without(newlyDeadPlayers)
      );

      return R.pipe(
        addToDeadPlayers,
        removeFromPlayers
      )(state);
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
    },
    'look': ({ playerId }) => state,
    'message': ({ text, toPlayerId }) => state
  })(evt)
);

export const rebuildStateFrom = (initState: DungeonState) => (events: DungeonEvent[]) => (
  R.reduce(
    logCall(reduceState),
    initState,
    events
  )
);

const logCall = <T extends Function>(f: T) => (...args: unknown[]) => {
  //console.log('Function call arguments: ', args);
  const res = f(...args);
  //console.log('Function call result: ', res);
  return res;
}
