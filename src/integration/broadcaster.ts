const uuidv4 = require('uuid/v4')

import {
    Observable,
    Observer,
    SlackAction
} from './types'

export class SlackBroadcaster implements Observable {
    private observers: Map<string, Observer> = new Map();

    public attach(observer: Observer): string {
        const id = uuidv4();
        this.observers.set(id, observer);
        return id;
    }

    public detach(id: string): boolean {
        return this.observers.delete(id);
    }

    public notify(action: SlackAction): void {
        for (let observer of this.observers) {
            observer[1].update(action);
        }
    }
}