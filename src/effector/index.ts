import * as R from 'ramda';
const L = require('partial.lenses');

import { match } from "../stateReconstructor/unionHelpers";
import { Direction, DungeonState, Room } from "../stateReconstructor/dungeonState";
import { DungeonEvent, Move, makeFactory } from '../stateReconstructor/events';

type StringResponse = {
  kind: 'string-response';
  response: string;
};

type Alert = {
  kind: 'alert';
  text: string;
  toPlayerId: number;
}

type Effect = StringResponse | Alert;

export const StringResponse = makeFactory<StringResponse>('string-response');
export const Alert = makeFactory<Alert>('alert');

const EffectsFromEvent = (state: DungeonState) => match<DungeonEvent, Effect[]>({
  'move': ({direction, playerId}: {direction: Direction, playerId: number}) => {
    return [StringResponse({response: 'good move!'})];
  },
  'pick-up': ({itemId, playerId}) => {
    return [StringResponse({response: 'cool shit bro'})];
  },
  'stab': ({playerId}) => {
    return [Alert({text: 'you done dead', toPlayerId: 1})];
  }
});