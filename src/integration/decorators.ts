import {
    Decorator,
    ActionType,
    NavigationAction,
    DecorateMetadata,
    PlainResponseBody,
    Room
} from './types'

export class NavigationDecorator implements Decorator {
    public decorate({ channel, as_user = 'mudbot', room }: DecorateMetadata): any {
        return {
            channel, //'UFGEC4XNX', // slack user ID for direct message
            as_user, // 'mudbot', // name of bot
            type: 'mrkdwn',
            text: room.roomDesc,
            attachments: [{
                text: 'Make your next move',
                callback_id: 'myCallback', //TODO: callbackId from Slack
                color: '#3AA3E3',
                attachment_type: 'default',
                actions: this.getNavigation(room)
            }]
        };
    }

    private getNavigation(room: Room): Array<NavigationAction> {
        const navs: Array<NavigationAction> = [];
        const common = { name: 'move', type: 'button' };
        if (room.west) navs.push({ ...common, text: '<', value: 'west' });
        if (room.north) navs.push({ ...common, text: '^', value: 'north' });
        if (room.south) navs.push({ ...common, text: 'v', value: 'south' });
        if (room.east) navs.push({ ...common, text: '>', value: 'east' });
        return navs;
    }
}

class PlainDecorator implements Decorator {
    private playMsg: string = "Not in the mood to chat. Would you like to play a game instead? Type 'play game' to begin.";
    public decorate({ channel, as_user = 'mudbot' }: DecorateMetadata): PlainResponseBody {
        const body: PlainResponseBody = {
            channel,
            as_user,
            text: this.playMsg
        }
        return body;
    }
}

export class DecoratorFactory {
    static getDecorator(type: ActionType): any {
        switch (type) {
            case ActionType.Play:
            case ActionType.Move:
                return new NavigationDecorator();
            default:
                return new PlainDecorator();
        }
    }
}