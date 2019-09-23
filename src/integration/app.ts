import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import rp from 'request-promise';
import { SlackBroadcaster } from './broadcaster';
import { SlackResponder } from './responder';

import {
    SlackAction,
    ActionType
} from './types';

const app = new Koa();
const router = new Router();
router.prefix('/slack');
app.use(bodyParser());

const slackBroadcaster = new SlackBroadcaster();
const slackResponder = new SlackResponder(rp);
const responderId = slackBroadcaster.attach(slackResponder);

console.log("XXXX ID", responderId)

router.post('/bot', async (ctx, next) => {

    // for URL validation during bot event subscription set up/config
    if (ctx.request.body.challenge) {
        ctx.body = { challenge: ctx.request.body.challenge };
    }

    // get user response from interactive component
    if (!ctx.request.body.event && ctx.request.body.payload) {
        try {
            const { actions, channel, team, user } = JSON.parse(ctx.request.body.payload);
            const { name, value, type } = actions;
            console.log("User made a move", actions, user);
            // TODO: user just made a move on the board, handle accordingly. Currently, bot just sends "OK" message

        } catch (error) {
            // TODO: most likely JSON parsing error, log & handle
        }
    }

    // reply only to client message and not bot's
    const event = ctx.request.body.event;
    if (event && event.client_msg_id) {

        const { user, channel } = event;
        let slackAction: SlackAction = {
            type: ActionType.Chat,
            slackUserId: user,
            channelId: channel
        }

        if (event.text.toLowerCase().includes('play game')) {
            slackAction = { ...slackAction, type: ActionType.Play }
            slackBroadcaster.notify(slackAction);
        } else {
            // laconic intro message
            slackBroadcaster.notify(slackAction);
        }
    }
    ctx.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(4444);
