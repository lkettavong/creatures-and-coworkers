import Router from 'koa-router';
import * as R from 'ramda';

import ForsakenGoblinTemplate from '../templates/ForsakenGoblin.json';
import TestTower from '../templates/TestTower.json';
import { Move, PickUp, Stab, DropInToDungeon, DungeonEvent } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { EventEffector } from '../effector';
import { EventActualizer } from '../actualizer';
import { Context } from 'koa';
import { lenses } from '../stateReconstructor/lenses';
import Knex from 'knex';
import { match } from '../stateReconstructor/unionHelpers';
import { gatherEvents, saveEvents, Event } from '../db/events';
import {
  user as userMiddleware,
  dungeon as dungeonMiddleware
} from '../middleware';
import { namespace } from '../middleware/util';

const router = new Router();
router.prefix('/dungeon');

let forsakenGoblinTemple = DungeonState(ForsakenGoblinTemplate);
let testTower = DungeonState(TestTower);

const look = async (ctx: Context) => {
  const { user, currentDungeonState } = ctx[namespace];

  const roomName = R.view(lenses.playerRoom(user.id), currentDungeonState);
  const room     = R.view(lenses.room(roomName), currentDungeonState);

  ctx.body = room;
};

const move = async (ctx: Context) => {
  const db = ctx.db as Knex;
  const { user, currentDungeon, currentDungeonState } = ctx[namespace];

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
};

router.get('/', async ctx => {
  ctx.body = forsakenGoblinTemple;
});

router.get('/look',
  userMiddleware.withUser,
  dungeonMiddleware.withCurrentDungeon,
  dungeonMiddleware.withCurrentDungeonTemplate,
  dungeonMiddleware.withAutoParticipation,
  dungeonMiddleware.withRebuiltState,
  look
);
router.post('/look', 
  userMiddleware.withUser,
  dungeonMiddleware.withCurrentDungeon,
  dungeonMiddleware.withCurrentDungeonTemplate,
  dungeonMiddleware.withAutoParticipation,
  dungeonMiddleware.withRebuiltState,
  look
);

router.post('/move/:direction', 
  userMiddleware.withUser,
  dungeonMiddleware.withCurrentDungeon,
  dungeonMiddleware.withCurrentDungeonTemplate,
  dungeonMiddleware.withAutoParticipation,
  dungeonMiddleware.withRebuiltState,
  move
);
router.get('/move/:direction', 
  userMiddleware.withUser,
  dungeonMiddleware.withCurrentDungeon,
  dungeonMiddleware.withCurrentDungeonTemplate,
  dungeonMiddleware.withAutoParticipation,
  dungeonMiddleware.withRebuiltState,
  move
);

export default router;


