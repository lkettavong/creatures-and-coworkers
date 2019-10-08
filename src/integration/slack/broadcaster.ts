const uuidv4 = require('uuid/v4')
import {
    RequestContext,
    Subscriber,
    Subscribable
} from './types'

export class SlackPublisher implements Subscribable {
    private subscribers: Map<string, Subscriber> = new Map();

    public add(subscriber: Subscriber, id: string = uuidv4()): string {
        this.subscribers.set(id, subscriber);
        return id;
    }

    public remove(id: string): boolean {
        return this.subscribers.delete(id);
    }

    public notify(requestCtx: RequestContext): void {
        for (let subscriber of this.subscribers) {
            subscriber[1].respond(requestCtx);
        }
    }
}