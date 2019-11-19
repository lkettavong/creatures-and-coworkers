import Router from 'koa-router';
import * as R from 'ramda';

import ForsakenGoblinTemplate from '../templates/ForsakenGoblin.json';
import TestTower from '../templates/TestTower.json';
import { Move, PickUp, Stab, DropInToDungeon, DungeonEvent, Look, Message } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
import { EventEffector } from '../effector';
import { EventActualizer } from '../actualizer';
import { Context } from 'koa';
import { lenses } from '../stateReconstructor/lenses';
import Knex from 'knex';
import { match } from '../stateReconstructor/unionHelpers';
import { gatherEvents, saveEvents, Event } from '../db/events';
import {
  establishStateMiddlewares
} from '../middleware';
import { namespace } from '../middleware/util';

//**** Slack integration - standalone mode ********************/
import rp from 'request-promise';
require('dotenv').config();
import { SlackPublisher } from '../integration/slack/broadcaster';
import { SlackSubscriber } from '../integration/slack/responder';
import { handleRequest } from '../integration/slack/context';
import { DungeonMaster } from '../integration/slack/master';
import * as forsakenGoblin from '../integration/slack/dungeon.json';

import {
  Item,
  Player,
  Room
} from './../integration/slack/model';

const slackPublisher = new SlackPublisher();
slackPublisher.add(new SlackSubscriber(rp));
const mudGame = DungeonMaster.getInstance(forsakenGoblin);
//*************************************************************/

const router = new Router();
router.prefix('/dungeon');

let forsakenGoblinTemple = DungeonState(ForsakenGoblinTemplate);
let testTower = DungeonState(TestTower);

const look = async (ctx: Context) => {
  const { user, currentDungeonState } = ctx[namespace];
  const getEffects = EventEffector(currentDungeonState);
  const actualize = EventActualizer(ctx)(currentDungeonState);
  const lookEvt = Look({
    playerId: user.id
  });
  await Promise.all(
    getEffects(lookEvt).map(actualize)
  );
};

const move = async (ctx: Context) => {
  const db = ctx.db as Knex;
  const { user, currentDungeon, currentDungeonState } = ctx[namespace];

  const getEffects = EventEffector(currentDungeonState);
  const actualize = EventActualizer(ctx)(currentDungeonState);

  const moveEvt = Move({
    playerId: user.id,
    direction: ctx.params.direction || ctx.request.body.text
  });

  await saveEvents(
    db, user.id, currentDungeon.id
  )([moveEvt]);

  await Promise.all(
    getEffects(moveEvt).map(actualize)
  );
};

const alert = async (ctx: Context) => {
  const { currentDungeonState } = ctx[namespace];
  const getEffects = EventEffector(currentDungeonState);
  const actualize = EventActualizer(ctx)(currentDungeonState);
  const msgEvt = Message({
    text: "Wassup my dude?",
    toPlayerId: ctx.request.body.text
  });
  await Promise.all(
    getEffects(msgEvt).map(actualize)
  );
}

router.get('/', async ctx => {
  ctx.body = forsakenGoblinTemple;
});

router.get('/look', ...establishStateMiddlewares, look);
router.post('/look', ...establishStateMiddlewares, look);

router.post('/move', ...establishStateMiddlewares, move);
router.get('/move/:direction', ...establishStateMiddlewares, move);

router.post('/alert', ...establishStateMiddlewares, alert);
router.get('/alert', ...establishStateMiddlewares, alert);
//**** Slack integration - standalone mode ********************/
router.get('/bot/:id', async (ctx: Context) => {
  // test: build game context for player
  const player: Player = mudGame.findOrAddPlayer(ctx.params.id);
  const room: Room = mudGame.getRoomById("chamber-4pvk1dtqyk6");
  const item1: Item = mudGame.getItemById("gold-4wtk1dtw2n8");
  const item2: Item = mudGame.getItemById("gold-4wtk1dtw2n9");
  mudGame.pickupItem({ playerId: player.getId(), roomId: room.getId(), itemId: item1.getId() });
  mudGame.pickupItem({ playerId: player.getId(), roomId: room.getId(), itemId: item2.getId() });
  ctx.body = mudGame.getGameContext(ctx.params.id)
});

// POC - Slack standalone mode...not integrated with rest of repo
router.post('/bot', async (ctx, next) => {
  ctx.status = 200;
  ctx.body = '';
  slackPublisher.notify(handleRequest(ctx, mudGame));
});
//*************************************************************/

export default router;