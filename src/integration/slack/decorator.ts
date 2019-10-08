//import * as R from 'ramda';
import {
    DecoratorUtil,
    AiLogger as Console,
} from './util';

import {
    RequestType
} from './types';

export const Decorator = (() => {

    const _decorateChat = ({ response, requestCtx }: any): any => {
        // TODO: add text parser and response accordingly
        const playMsg: string = "Not really in the mood to chat. Would you like to play a game instead? Type 'play' to begin.";
        Object.assign(response, { text: playMsg });
        return response;
    }

    const _decoratePlay = ({ response, requestCtx }: any): any => {
        const { dungeonMaster } = requestCtx;
        const { underworld } = dungeonMaster;
        const { name, description, image, helpText } = underworld;
        Object.assign(response, { text: "Dungeon entrance, enter at your own risk" });
        const blocks: Array<any> = [
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": `*${name}* ${description}`
              }
          },
          {
              "type": "image",
              "title": {
                  "type": "plain_text",
                  "text": "Dungeon",
                  "emoji": true
              },
              "image_url": `${image}`,
              "alt_text": "Dungeon"
          },
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": `${helpText}`
              }
          }
      ];
      Object.assign(response, { blocks });
      // add 'Start' button
      const attachments: Array<any> = [
          {
              text: "Let's go find some gold!",
              callback_id: "myCallback", //TODO: developer defined in Slack admin/config page, still not clear on purpose of this
              color: "#C2061E",
              attachment_type: "default",
              actions: [{
                  name: "start",
                  type: "button",
                  action_id: "start",
                  text: "Start",
                  value: "start"
              }]
          }
      ];
      Object.assign(response, { attachments });
      return response;
    }

    const _decorateMove = ({ response, requestCtx }: any): any => {
        const { player, room } = requestCtx;
        const { id, name, description, image, directions, items } = room;
        Object.assign(response, { type: "mrkdwn", text: id });

        // add room description/image
        const blocks: Array<any> = [
            { type: "divider" },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*_${name}_*\n${description}`
                },
                accessory: {
                    type: "image",
                    image_url: `${image}`,
                    alt_text: "Dungeon"
                }
            }
        ];

        if (items.length > 0) {
            blocks.push(
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "_Items up for grabs_"
                        }
                    ]
                }
            );
            //blocks.push({ type: "divider" });

            for (let item of items) {
                let { id, name, description, value, property } = item;
                blocks.push(
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `:moneybag: *_${name}_ (${value} gold coins)*\n${description}`
                        },
                        accessory: {
                            type: "button",
                            text: {
                                type: "plain_text",
                                emoji: true,
                                text: "pickup"
                            },
                            "value": id
                        }
                    }
                );
            }
        }
        Object.assign(response, { blocks });
        // add navigation buttons
        if (directions.length > 0) {
            let attachments = [
                {
                    text: "*_Make your next move_*",
                    callback_id: "myCallback", //TODO: callbackId from Slack
                    color: "#3AA3E3",
                    attachment_type: "default",
                }
            ];

            let actions = [];
            for (let move of directions) {
                actions.push({
                    name: "move",
                    type: "button",
                    action_id: move.direction,
                    text: DecoratorUtil.getNavigationLabel(move.direction),
                    value: move.id
                })
            }

            if (player.inventory.length > 0) {
                actions.push({
                    name: "inventory",
                    type: "button",
                    action_id: "inventory",
                    text: "i",
                    value: "inventory"
                });
            }

            Object.assign(attachments[0], { actions });
            Object.assign(response, { attachments });
        }
        return response;
    }

    const _decorateInventory = ({ response, requestCtx }: any): any => {
        const { inventory, gold } = requestCtx.player;
        Object.assign(response, { type: "mrkdwn", text: 'Inventory' });
        const blocks: Array<any> = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*_Current inventory_*"
                }
            },
            {
                type: "divider"
            }
        ];

        if (inventory.length > 0) {
            for (let item of inventory) {
                let { id, name, description, value, property } = item;
                blocks.push(
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `:moneybag: *_${name} (x${value} gold coins)_*: ${description}`
                        }
                    });
            }

            blocks.push(
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `:moneybag: *_ x ${gold} gold coins_*`
                    }
                });
        }

        Object.assign(response, { blocks });
        const attachments: Array<any> = [{
            text: "Let's continue playing!",
            callback_id: "myCallback", //TODO: callbackId from Slack
            color: "#C2061E",
            attachment_type: "default",
            actions: [{
                name: "resume",
                type: "button",
                action_id: "resume",
                text: "Resume",
                value: "resume"
            }]
        }];

        Object.assign(response, { attachments });
        return response;
    }

    const _handlerMap: Map<string, Function> = new Map();
    _handlerMap.set(RequestType.Chat, _decorateChat);
    _handlerMap.set(RequestType.Play, _decoratePlay);
    _handlerMap.set(RequestType.Start, _decorateMove);
    _handlerMap.set(RequestType.Move, _decorateMove);
    _handlerMap.set(RequestType.Pickup, _decorateMove);
    _handlerMap.set(RequestType.Inventory, _decorateInventory);
    _handlerMap.set(RequestType.Drop, () => 'TODO: drop');
    _handlerMap.set(RequestType.Ignore, () => 'No action');

    const _decorate = ({ response, requestCtx }: any) => {
        const { type } = requestCtx;
        if (type !== RequestType.Ignore) return _handlerMap.get(type)({ response, requestCtx });
    }

    return {
        decorate: _decorate
    }
})();
