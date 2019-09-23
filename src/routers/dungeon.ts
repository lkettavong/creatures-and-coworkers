import Router from 'koa-router';
const L = require('partial.lenses');

import ForsakeGoblinTemplate from '../templates/ForsakenGoblin.json';
import { reduceState, lenses } from '../stateReconstructor';
import { Move, PickUp, Stab } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { EventEffector } from '../effector';
import { EventActualizer } from '../actualizer';

const router = new Router();
router.prefix('/dungeon');

let forsakenGoblinTemple = DungeonState(ForsakeGoblinTemplate);

router.get('/', async ctx => {
  ctx.body = ForsakeGoblinTemplate;
});

router.get('/look', async ctx => {
  const playerId = 1;

  const roomName = L.get(lenses.playerRoom(playerId), forsakenGoblinTemple);
  const room     = L.get(lenses.room(roomName), forsakenGoblinTemple);

  ctx.body = room;
});

router.get('/move/:direction', async ctx => {
  //Create Move event
  //in order:
  // - pull event logs, run reduceState across them
  // - call effector with that state + Move event to get array of effects
  // - do those effects
  // - save Move to events table
  const moveEvt = Move({
    playerId: 1, direction: ctx.params.direction
  });

  // pull event logs, run reduceState across them

  const effect = EventEffector(forsakenGoblinTemple);
  const effectsToPerform = effect(moveEvt);

  const actualize = EventActualizer(ctx)(forsakenGoblinTemple);
  effectsToPerform.forEach(actualize);

  forsakenGoblinTemple = reduceState(forsakenGoblinTemple)(moveEvt);

  // Save Move to the events table
});

export default router;


