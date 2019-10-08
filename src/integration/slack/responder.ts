import * as R from 'ramda';
import { Decorator } from './decorator';

import {
    RequestContext,
    RequestType,
    Subscriber,
} from './types';

export class SlackSubscriber implements Subscriber {
    private httpHandler: any;
    private handlerMap: Map<string, Function>;

    constructor(httpHandler: any) {
        this.httpHandler = httpHandler;
        this.mapHandlers();
    }

    private mapHandlers() {
        this.handlerMap = new Map();
        this.handlerMap.set(RequestType.Move, this.handleInteractiveComponent);
        this.handlerMap.set(RequestType.Play, this.handleInteractiveComponent);
        this.handlerMap.set(RequestType.Start, this.handleInteractiveComponent);
        this.handlerMap.set(RequestType.Pickup, this.handleInteractiveComponent);
        this.handlerMap.set(RequestType.Inventory, this.handleInteractiveComponent);
        this.handlerMap.set(RequestType.Chat, this.handleChat);
        this.handlerMap.set(RequestType.Verify, this.handleChallenge);
        this.handlerMap.set(RequestType.Ignore, () => 'No action');
    }

    public respond(requestCtx: RequestContext): void {
        const { type } = requestCtx;
        if (type !== RequestType.Ignore) this.handlerMap.get(type)(requestCtx);
    }

    private getCommonResponse = (requestCtx: RequestContext): any => {
        const { timestamp, player } = requestCtx;
        return {
            channel: player.id, //for direct user messaging, use userID else use channel ID from requestCtx
            as_user: true,
            callback_id: "myCallback",
            ts: timestamp
        }
    }

    private handleInteractiveComponent = (requestCtx: RequestContext): void => {
        let response = this.getCommonResponse(requestCtx);
        response = Decorator.decorate({ response, requestCtx });
        this.sendReponse({ response, requestCtx });
    }

    private handleChallenge = (requestCtx: RequestContext): void => {
        const { ctx, challenge } = requestCtx;
        ctx.status = 200;
        ctx.body = { challenge };
    }

    private handleChat = (requestCtx: RequestContext): any => {
        let response = this.getCommonResponse(requestCtx);
        response = Decorator.decorate({ response, requestCtx });
        this.sendReponse({ response, requestCtx });
    }

    private sendReponse = ({ response, requestCtx }: any) => {
        const postActions = [RequestType.Chat, RequestType.Move, RequestType.Play, RequestType.Resume, RequestType.Start];
        // 'chat.postMessage' creates new post in chat thread
        // 'responseUrl' re-renders current post with new content (text, widgests, images, etc.)
        const url = R.includes(requestCtx.type, postActions) ? 'https://slack.com/api/chat.postMessage' : requestCtx.responseUrl;
        (async () => {
          await this.httpHandler({
            method: 'POST',
            url,
            headers: {
                'Authorization': `Bearer ${process.env.SLACK_BOT_USER_OAUTH_TOKEN}`, //defined in '.env' file
                'Content-type': 'application/json; charset=utf-8'
            },
            json: true,
            body: response
          });
        })();
    }
}
