import * as R from 'ramda';
const L = require('partial.lenses');

import { match } from "../stateReconstructor/unionHelpers";
import { Direction, DungeonState, Room } from "../stateReconstructor/dungeonState";
import { DungeonEvent, Move, makeFactory } from '../stateReconstructor/events';
import { lenses } from '../stateReconstructor';

export type StringResponse = {
  kind: 'string-response';
  response: string;
};

export type Alert = {
  kind: 'alert';
  text: string;
  toPlayerId: number;
}

export type Effect = StringResponse | Alert;

export const StringResponse = makeFactory<StringResponse>('string-response');
export const Alert = makeFactory<Alert>('alert');

export const EventEffector = (state: DungeonState) => match<DungeonEvent, Effect[]>({
  'move': ({direction, playerId}: {direction: Direction, playerId: number}) => {
    const currentRoomName: string = L.get(lenses.playerRoom(playerId), state);
    const currentRoom: Room = L.get(lenses.room(currentRoomName), state);

    const nextRoomName = currentRoom[direction];
    const nextRoom: Room = L.get(lenses.room(nextRoomName), state);

    if (!nextRoom) {
      return [StringResponse({response: "You can't do that. "})];
    }

    return [StringResponse({response: nextRoom.roomName + '\n\n' + nextRoom.roomDesc})];
  },
  'pick-up': ({itemId, playerId}) => {
    return [StringResponse({response: 'cool shit bro'})];
  },
  'stab': ({playerId}) => {
    const toPlayerId = 1;

    return [Alert({text: 'you done dead', toPlayerId})];
  },
  'drop-in': ({playerId}) => {
    const playerRoom: Room = L.get(lenses.playerRoom(playerId), state);

    return [StringResponse({response: playerRoom.roomDesc})];
  }
});