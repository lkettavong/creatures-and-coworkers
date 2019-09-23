import {
    Observer,
    SlackAction,
    Room
} from './types'

import { DecoratorFactory } from './decorators'

export class SlackResponder implements Observer {
    private httpHandler: any;

    constructor(httpHandler: any) {
        this.httpHandler = httpHandler;
    }

    public async update({ type, slackUserId }: SlackAction): Promise<boolean> {

        // TODO: remove hardcoded
        //    1. fetch URL and token form config
        //    2. get room info state machine?

        const room: Room = {
            "roomName": "The Goblin Cloak Room",
            "roomDesc": "You enter a small room lined on two sides with open closets full of empty hangers.  There is a drab brown cloak hanging all alone on a hanger in the middle of one closet.",
            "north": "The Entrance Hall",
            "south": "",
            "east": "The Tomb of the Unknown Goblin",
            "west": "The Entrance Hall",
            "up": "",
            "down": "",
            "items": []
        }

        const response = await this.httpHandler({
            method: 'POST',
            url: 'https://slack.com/api/chat.postMessage',
            headers: {
                'Authorization': 'Bearer xoxb-525990151425-767913038884-0ikzdX3hQndMGjN4CFq1Fc4L',
                'Content-type': 'application/json'
            },
            json: true,
            body: DecoratorFactory.getDecorator(type).decorate({ channel: slackUserId, room })
        });
        return response.ok;
    }
}
