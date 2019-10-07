import Knex from 'knex';
import { Context } from 'koa';
import { Dungeon } from '../db/dungeons.js';
import { gatherEvents, saveEvents, Event } from '../db/events';
import { namespace, updateCNCMiddlewareNamespace } from './util';
import { rebuildStateFrom } from '../stateReconstructor';
import { Next } from '../routers/util';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { Template } from '../db/templates.js';

export const withCurrentDungeon = async (ctx: Context, next: Next) => {
  const db = ctx.db as Knex;

  let [currentDungeon] = await db<Dungeon>('dungeons')
    .select('*')
    .where('is_active', true);

  if (!currentDungeon) {
    const display_name = ctx.request.body.user_name || "Bobby Digital";

    const allTemplates = await db<Template>('templates')
      .select('*');

    const template = allTemplates[
      Math.floor(Math.random() * allTemplates.length)
    ];

    currentDungeon = (
      await db<Dungeon>('dungeons')
        .insert({
          is_active: true,
          template_id: template.id
        })
        .returning('*')
    )[0];
  }
  ctx[namespace] = updateCNCMiddlewareNamespace(ctx, { currentDungeon });

  await next();
};

//TODO join me with withCurrentDungeon
export const withCurrentDungeonTemplate = async (ctx: Context, next: Next) => {
  const db = ctx.db as Knex;
  const { currentDungeon } = ctx[namespace];

  const [currentTemplate] = await db<Template>('templates')
    .select('*')
    .where('id', currentDungeon.template_id);
  
  ctx[namespace] = updateCNCMiddlewareNamespace(ctx, { currentTemplate });

  await next();
};

export const withAutoParticipation = async (ctx: Context, next: Next) => {
  const db = ctx.db as Knex;
  const { user, currentDungeon } = ctx[namespace];

  const [dropInEventForUser] = await db<Event>('events')
    .select('*')
    .where({
      user_id: user.id,
      dungeon_id: currentDungeon.id,
      type: 'drop-in'
    });

  if (!dropInEventForUser) {
    await db<Event>('events')
      .insert({
        user_id: user.id,
        dungeon_id: currentDungeon.id,
        type: 'drop-in'
      });
  }

  await next();
};

export const withRebuiltState = async (ctx: Context, next: Next) => {
  const db = ctx.db as Knex;
  const { currentDungeon, currentTemplate } = ctx[namespace];

  const events = await gatherEvents(db, currentDungeon.id);

  const currentDungeonState = rebuildStateFrom(DungeonState(currentTemplate.model))(
    events
  );

  ctx[namespace] = updateCNCMiddlewareNamespace(ctx, { currentDungeonState });
  await next();
};
