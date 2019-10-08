import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import rp from 'request-promise';
import { SlackPublisher } from './broadcaster';
import { SlackSubscriber } from './responder';
import { handleRequest } from './context';
import * as forsakenGoblin from './dungeon.json';
import { DungeonMaster } from './master'
import { Context } from 'koa';
require('dotenv').config()

import {
  Item,
  Player,
  Room
} from './model';

const app = new Koa();
const router = new Router();
router.prefix('/slack');
app.use(bodyParser());

const slackPublisher = new SlackPublisher();
slackPublisher.add(new SlackSubscriber(rp));
const mudGame = DungeonMaster.getInstance(forsakenGoblin);

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

// POC - Slack standalone mode
router.post('/bot', async (ctx, next) => {
  ctx.status = 200; 
  ctx.body = '';
  slackPublisher.notify(handleRequest(ctx, mudGame));
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(6666);