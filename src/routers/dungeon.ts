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
  ctx.body = reduceState(ForsakeGoblinDungeon)(Move({
    playerId: 1, direction: ctx.params.direction
  }));
});

export default router;


