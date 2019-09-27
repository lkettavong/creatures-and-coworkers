import * as R from 'ramda';

import { match } from "../stateReconstructor/unionHelpers";
import { DungeonState } from "../stateReconstructor/dungeonState";
import { Effect } from '../effector';
import { Context } from 'koa';

export const EventActualizer = (ctx: Context) => (state: DungeonState) => match<Effect, Promise<void>>({
  'string-response': async ({response}) => {
    ctx.body = !!ctx.body
      ? ctx.body + response
      : response;
  },
  'alert': async ({text, toPlayerId}) => {
    // Send a slack message to player(toPlayerId) saying `text`
  },
  'slack-response': async ({response}) => {
    ctx.type = 'application/json';

    ctx.body = response;
  }
});