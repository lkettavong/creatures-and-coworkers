export interface Player {
  id: string;
  gold: number;
  room: string;
  inventory: string[]
};

export interface Room {
  roomName: string;
  roomDesc: string;
  roomImg: string;
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

export interface DungeonJSON {
  dungeonName: string;
  dungeonDesc: string;
  helpText: string;
  rooms: Array<Room>
}

export type DungeonState = {
  players: Player[];
  deadPlayers: number[];
} & DungeonJSON;

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export const DungeonState = (jsonObj: any): DungeonState => ({
  dungeonName: jsonObj.dungeonName,
  dungeonDesc: jsonObj.dungeonDesc,
  helpText: jsonObj.helpText,
  rooms: jsonObj.rooms.map((room: any) => ({
    roomName: room.roomName,
    roomDesc: room.roomDesc,
    roomImg: room.roomImg,
    north: room.north,
    south: room.south,
    east: room.east,
    west: room.west,
    up: room.up,
    down: room.down,
    items: room.items.map((item: any) => ({
      itemName: item.itemName,
      itemDesc: item.itemDesc,
      itemValue: parseInt(item.itemValue, 10),
      itemProperty: item.itemProperty
    }))
  })),
  players: [],
  deadPlayers: []
});
