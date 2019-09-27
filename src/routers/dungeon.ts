import Router from 'koa-router';
import * as R from 'ramda';

import ForsakenGoblinTemplate from '../templates/ForsakenGoblin.json';
import TestTower from '../templates/TestTower.json';
import { reduceState, rebuildStateFrom } from '../stateReconstructor';
import { Move, PickUp, Stab, DropInToDungeon, DungeonEvent } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { EventEffector } from '../effector';
import { EventActualizer } from '../actualizer';
import { Context } from 'koa';
import { lenses } from '../stateReconstructor/lenses';
import Knex from 'knex';
import { match } from '../stateReconstructor/unionHelpers';
import { gatherEvents, saveEvents, Event } from '../db/events';
import { Dungeon } from '../db/dungeons.js';
import { User } from '../db/users.js';

const router = new Router();
router.prefix('/dungeon');

let forsakenGoblinTemple = DungeonState(ForsakenGoblinTemplate);
let testTower = DungeonState(TestTower);

type HandlerF = (ctx: Context) => Promise<any>;

const withUser =
  (handler: (user: User) => HandlerF): HandlerF =>
    async (ctx) => {
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

      return handler(user)(ctx);
    };

const withAutoParticipation = (user: User, dungeon: Dungeon) =>
  (handler: HandlerF): HandlerF =>
    async (ctx) => {
      const db = ctx.db as Knex;

      const [dropInEventForUser] = await db<Event>('events')
        .select('*')
        .where({
          user_id: user.id,
          dungeon_id: dungeon.id,
          type: 'drop-in'
        });

      if (!dropInEventForUser) {
        await db<Event>('events')
          .insert({
            user_id: user.id,
            dungeon_id: dungeon.id,
            type: 'drop-in'
          });
      }

      return handler(ctx);
    };

const withCurrentDungeon =
  (handler: (dungeon: Dungeon) => HandlerF): HandlerF =>
    async (ctx) => {
      const db = ctx.db as Knex;

      const [currentDungeon] = await db<Dungeon>('dungeons')
        .select('*')
        .where('is_active', true);

      return handler(currentDungeon)(ctx);
    };

const withRebuiltState = (playerId: string) =>
  (handler: (state: DungeonState) => HandlerF): HandlerF =>
    async (ctx) => {
      const db = ctx.db as Knex;

      const events = await gatherEvents(db);

      const currentDungeonState = rebuildStateFrom(forsakenGoblinTemple)(
        events
      );

      return handler(currentDungeonState)(ctx);
    };

/* ///////////////////////////////////////////////////////////////////////// */

const look =
  withUser(                                   user =>
  withCurrentDungeon(                         currentDungeon =>
  withAutoParticipation(user, currentDungeon)(
  withRebuiltState(user.id)(                  currentDungeonState =>
    async (ctx) => {
      const roomName = R.view(lenses.playerRoom(user.id), currentDungeonState);
      const room     = R.view(lenses.room(roomName), currentDungeonState);

      ctx.body = room;
    }
  ))));

const move =
  withUser(                                   user =>
  withCurrentDungeon(                         currentDungeon =>
  withAutoParticipation(user, currentDungeon)(
  withRebuiltState(user.id)(                  currentDungeonState =>
    async (ctx) => {
      const db = ctx.db as Knex;

      const getEffects = EventEffector(currentDungeonState);
      const actualize = EventActualizer(ctx)(currentDungeonState);

      const moveEvt = Move({
        playerId: user.id,
        direction: ctx.params.direction
      });

      await saveEvents(
        db, user.id, currentDungeon.id
      )([moveEvt]);

      await Promise.all(
        getEffects(moveEvt).map(actualize)
      );
    }
  ))));

router.get('/', async ctx => {
  ctx.body = forsakenGoblinTemple;
});

router.get('/look', look);
router.post('/look', look);

router.post('/move/:direction', move);
router.get('/move/:direction', move);

export default router;


