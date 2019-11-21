import * as R from 'ramda';

import { roomBlocks } from "./slackResponse";
import { match, makeFactory } from "../stateReconstructor/unionHelpers";
import { Direction, DungeonState, Room, Player } from "../stateReconstructor/dungeonState";
import { DungeonEvent, Move } from '../stateReconstructor/events';
import { lenses } from '../stateReconstructor/lenses';
import { lensFilter, lensCompose } from '../util/lens';

export type StringResponse = {
  kind: 'string-response';
  response: string;
};

export type Alert = {
  kind: 'alert';
  text: string;
  toPlayerId: string;
}

export type SlackResponse = {
  kind: 'slack-response';
  response: string;
};

export type Effect = StringResponse | Alert | SlackResponse;

export const StringResponse = makeFactory<StringResponse>('string-response');
export const Alert          = makeFactory<Alert>('alert');
export const SlackResponse  = makeFactory<SlackResponse>('slack-response');

export const EventEffector = (state: DungeonState) => match<DungeonEvent, Effect[]>({
  'move': ({direction, playerId}) => {
    const currentRoomName: string = R.view(lenses.playerRoomName(playerId), state);
    const currentRoom: Room = R.view(lenses.room(currentRoomName), state);

    const nextRoomName = currentRoom[direction];
    const nextRoom: Room = R.view(lenses.room(nextRoomName), state);

    if (!nextRoom) {
      return [StringResponse({ response: `You can't do that: /move ${direction}` })];
    }

    return [SlackResponse({
      response: JSON.stringify(roomBlocks(nextRoom))
    })];
  },
  'pick-up': ({itemId, playerId}) => {
    return [StringResponse({response: 'cool shit bro'})];
  },
  'stab': ({ playerId }) => {
    const currentRoomName: string = R.view(lenses.playerRoomName(playerId), state);

    const playersInRoom = R.view(lensCompose(
      lenses.players(),
      lensFilter((p: Player) => p.room === currentRoomName)
    ), state);

    console.log(state);

    const toPlayerId = "U92LTTRT9";

    return [
      StringResponse({response: 'Stabbing everybody' }),
      Alert({text: 'you done dead', toPlayerId})
    ];
  },
  'drop-in': ({playerId}) => {
    const playerRoom: Room = R.view(lenses.playerRoomName(playerId), state);

    return [StringResponse({ response: playerRoom.roomDesc })];
  },
  'look': ({ playerId }) => {
    const currentRoomName: string = R.view(lenses.playerRoomName(playerId), state);
    const currentRoom: Room = R.view(lenses.room(currentRoomName), state);

    return [SlackResponse({
      response: JSON.stringify(roomBlocks(currentRoom))
    })];
  },
  'message': ({ text, toPlayerId }) => {
    return [Alert({ text, toPlayerId })];
  }
});