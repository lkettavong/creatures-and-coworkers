import Router from 'koa-router';
const L = require('partial.lenses');

import ForsakeGoblinTemplate from '../templates/ForsakenGoblin.json';
import { reduceState, lenses } from '../stateReconstructor';
import { Move, PickUp, Stab, DropInToDungeon } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { EventEffector } from '../effector';
import { EventActualizer } from '../actualizer';
import { Context } from 'koa';
import lens from 'ramda/es/lens';

const router = new Router();
router.prefix('/dungeon');

let forsakenGoblinTemple = DungeonState(ForsakeGoblinTemplate);

const look = async (ctx: Context) => {
  const playerId: string = ctx.request.body.user_id || '1';

  const roomName = L.get(lenses.playerRoom(playerId), forsakenGoblinTemple);
  const room     = L.get(lenses.room(roomName), forsakenGoblinTemple);

  ctx.body = !!room
    ? room
    : "You aren't in a room yet";
};

const move = async (ctx: Context) => {
  //Create Move event
  //in order:
  // - pull event logs, run reduceState across them
  // - call effector with that state + Move event to get array of effects
  // - do those effects
  // - save Move to events table
  const playerId: string = ctx.request.body.user_id || '1';

  if (!L.get(lenses.player(playerId), forsakenGoblinTemple)) {
    // TODO Get rid of me.
    forsakenGoblinTemple = reduceState(forsakenGoblinTemple)(
      DropInToDungeon({playerId})
    );
  }

  const moveEvt = Move({
    playerId, direction: ctx.params.direction
  });

  // pull event logs, run reduceState across them

  const effect = EventEffector(forsakenGoblinTemple);
  const effectsToPerform = effect(moveEvt);

  const actualize = EventActualizer(ctx)(forsakenGoblinTemple);
  effectsToPerform.forEach(actualize);

  forsakenGoblinTemple = reduceState(forsakenGoblinTemple)(moveEvt);

  // Save Move to the events table
};

router.get('/', async ctx => {
  ctx.body = forsakenGoblinTemple;
});

router.get('/look', look);
router.post('/look', look);

router.post('/move/:direction', move);
router.get('/move/:direction', move);

export default router;


