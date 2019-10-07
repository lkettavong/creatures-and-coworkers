import Knex from 'knex';
import { Context } from 'koa';
import { User } from '../db/users.js';
import { namespace, updateCNCMiddlewareNamespace } from './util';
import { Next } from '../routers/util';

export const withUser = async (ctx: Context, next: Next) => {
  const db = ctx.db as Knex;

  const external_id: string = ctx.request.body.user_name || 'e144ab9a-98dd-4a27-89f0-0f9c5fafd84d';

  let [user] = await db<User>('users')
    .select('*')
    .where({external_id});

  if (!user) {
    const display_name = ctx.request.body.user_name || "Bobby Digital";

    user = (
      await db<User>('users')
        .insert({
          display_name,
          external_id
        })
        .returning('*')
    )[0];
  }

  ctx[namespace] = updateCNCMiddlewareNamespace(ctx, { user });

  await next();
};
