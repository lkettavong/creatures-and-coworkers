import * as R from 'ramda';

import { match } from "../stateReconstructor/unionHelpers";
import { DungeonState } from "../stateReconstructor/dungeonState";
import { Effect } from '../effector';
import { Context } from 'koa';
import rp from 'request-promise';
import { User } from '../db/users';
import Knex from 'knex';

export const EventActualizer = (ctx: Context) => (state: DungeonState) => match<Effect, Promise<void>>({
  'string-response': async ({response}) => {
    ctx.body = !!ctx.body
      ? ctx.body + response
      : response;
  },
  'alert': async ({text, toPlayerId}) => {
    const db = ctx.db as Knex;

    const [user] = await db<User>('users')
      .where({id: toPlayerId});

    // toPlayerId slash command setting unescaped format: '@laekettavong'
    // toPlayerId slash command setting escaped format: '<@UFASC4XNX|laekettavong>' (need to parse for '@UFASC4XNX')
    const response = {
      channel: user.external_id, // for direct user messaging, use userID else use channel ID from requestCtx
      as_user: true,
      text
    };

    await rp({
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_USER_OAUTH_TOKEN}`, //defined in '.env' file
        'Content-type': 'application/json; charset=utf-8'
      },
      json: true,
      body: response
    });
  },
  'slack-response': async ({response}) => {
    ctx.type = 'application/json';

    ctx.body = response;
  }
});