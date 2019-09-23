export enum ActionType {
    Play = 'PLAY',
    Chat = 'CHAT',
    Move = 'MOVE',
    Grab = 'GRAB',
    Drop = 'DROP'
}

export interface SlackUser {
    id: string;
    slackUserId: string;
    name: string;
    screenName: string;
}

export type SlackAction = {
    type: ActionType;
    slackUserId: string;
    channelId?: string;
    text?: string;
}

export type moveAction = {
    direction: string;
} & SlackAction;

export type grabAction = {
    itemName: string;
} & SlackAction;

export interface Observer {
    update(action: SlackAction): void;
}

export interface Observable {
    attach(observer: Observer): string;
    detach(id: string): boolean;
    notify(action: SlackAction): void;
}

export type CommonResponseBody = {
    channel: string;
    as_user: string;
    type?: string;
}

export type PlainResponseBody = {
    text: string;
} & CommonResponseBody;

export type NavigationResponseBody = {
    attachments: Array<NavAttachment>;
} & CommonResponseBody;

export type NavigationAction = {
    name: string // widget group name, 'move',
    type: string // 'button',
    text: string // '>',
    value: string // 'east',
    confirm?: {
        title: string // 'Are you sure?',
        text: string // 'Wouldn\'t you want to continue forward?',
        ok_text: string // 'Yes',
        dismiss_text: string // 'No'
    }
}

export type NavAttachment = {
    text?: string, // test above navigation widget, 'Choose your move',
    callback_id: string // 'myCallback',
    fallback?: string;
    color?: string, // left vertical bar color, '#3AA3E3'
    attachment_type?: string // 'default',
    actions: Array<NavigationAction>
}

export type DecorateMetadata = {
    channel: string; // slack user ID for direct message, 'UFGEC4XNX'
    as_user: string;// bot name, 'mudbot', // name of bot
    room: Room;
}

export interface Decorator {
    decorate(roomData: DecorateMetadata): any;
}

// TODO: delete...duplicate, copied over
export interface Room {
    roomName: string;
    roomDesc: string;
    north: string;
    south: string;
    east: string;
    west: string;
    up: string;
    down: string;
    items: Array<{
        itemName: string;
        itemDesc: string;
        itemValue: number;
        itemProperty: string;
    }>
};
