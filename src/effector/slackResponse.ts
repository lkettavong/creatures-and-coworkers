import * as R from 'ramda';
import { Room } from "../stateReconstructor/dungeonState";

export const roomBlocks = (nextRoom: Room) => {

  // brute force, make it work first
  // TODO: rework...not every room has loot to pick up
  const directions: any = R.pickAll(['north', 'south', 'east', 'west', 'up', 'down'])(nextRoom);
  const dirs = R.reject((n: string) => R.isEmpty(n))(directions);
  const nagivation = R.pipe(R.toPairs, R.map(R.apply(R.objOf)))(dirs);
  const { roomName, roomDesc, roomImg, items } = nextRoom;


  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*${roomName}*\n${roomDesc}`
      },
      "accessory": {
        "type": "image",
        "image_url": `${roomImg}`,
        "alt_text": "Dungeon"
      }
    }
  ];

  if (items.length > 0) {
    const roomItems = ["*Pickup Loot*"];
    for (let [index, item] of items.entries()) {
      roomItems.push(`\n*_/pick-up ${++index}_* : ${item.itemName} - *${item.itemValue} x*:moneybag:`);
    }

    const mrkdwn = {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": roomItems.join('')
        }
      ]
    };

    Object.assign(blocks, [...blocks, mrkdwn]);
  }

  if (nagivation.length > 0) {
    const roomNav = ["*Navigation*"];
    for (let nav of nagivation) {
      roomNav.push(`\n*_/move ${Object.keys(nav)[0]}_* : ${Object.values(nav)[0]}`);
    }

    const mrkdwn = {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": roomNav.join('')
        }
      ]
    }

    Object.assign(blocks, [...blocks, mrkdwn]);
  }

  return { blocks }
}

/*
sample

{
  blocks: [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*The Goblin Cloak Room*\nYou enter a small room lined on two sides with open closets full of empty hangers.  There is a drab brown cloak hanging all alone on a hanger in the middle of one closet."
      },
      "accessory": {
        "type": "image",
        "image_url": "https://cdn.conceptartempire.com/images/08/2592/07-mages-tale-dungeon.jpg",
        "alt_text": "Dungeon"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*Loot* \n *_/pick one_* : The Tome Of Lowrasil - *30 x*:moneybag: \n *_/pick two_* : The Mace of Respect - *50 x*:moneybag:"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*Navigation* \n*_/move east_* : The Goblin Cloak Room\n *_/move west_* : The Dark Room"
        }
      ]
    }
  ]
}

*/