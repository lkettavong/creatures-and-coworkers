import Router from 'koa-router';
import ForsakeGoblinTemplate from '../templates/ForsakenGoblin.json';
const ForsakeGoblinDungeon = DungeonState(ForsakeGoblinTemplate);

import { reduceState } from '../stateReconstructor';
import { Move, PickUp, Stab } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState.js';
const router = new Router();
router.prefix('/dungeon');

router.get('/', async ctx => {
  //const { db } = ctx;
  //const { rows: results } = await db.raw('select * from users;');
  ctx.body = ForsakeGoblinTemplate;
});

router.get('/move/:direction', async ctx => {
  //Create Move event
  //in order:
  // - pull event logs, run reduceState across them
  // - call effector with that state + Move event to get array of effects
  // - do those effects
  // - save Move to events table

  ctx.body = reduceState(ForsakeGoblinDungeon)(Move({
    playerId: 1, direction: ctx.params.direction
  }));
});

export default router;


