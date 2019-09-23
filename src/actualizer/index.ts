import * as R from 'ramda';
const L = require('partial.lenses');

import { match } from "../stateReconstructor/unionHelpers";
import { DungeonState } from "../stateReconstructor/dungeonState";
import { Effect } from '../effector';
import { Context } from 'koa';

export const EventActualizer = (ctx: Context) => (state: DungeonState) => match<Effect, void>({
  'string-response': ({response}) => {
    ctx.body = !!ctx.body
      ? ctx.body + response
      : response;
  },
  'alert': ({text, toPlayerId}) => {
    // Send a slack message to player(toPlayerId) saying `text`
  }
});