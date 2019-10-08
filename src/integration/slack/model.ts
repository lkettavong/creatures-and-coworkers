import * as R from 'ramda';

import {
  Dungeon,
  DungeonRoomMetadata,
  PlayerRoomItemParam,
  PlayerRoomParam,
  RoomDirectionState,
  RoomItem
} from './types';

import { AiLogger as Console } from './util';

export class Item {
  private id: string;
  private name: string;
  private description: string;
  private value: number;
  private property: string;

  constructor(item: RoomItem) {
    this.id = item.itemId;
    this.name = item.itemName;
    this.description = item.itemDesc;
    this.value = +item.itemValue;
    this.property = item.itemProperty;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getValue(): number {
    return this.value;
  }

  public stringify(): string {
    return JSON.stringify(this);
  }
}

export class Room {
  private id: string;
  private name: string;
  private description: string;
  private image: string;
  private directions: Map<string, string>;
  private items: Map<string, Item>;

  constructor(room: DungeonRoomMetadata) {
    const { roomId, roomName, roomDesc, roomImg } = room;
    this.id = roomId;
    this.name = room.roomName;
    this.description = room.roomDesc;
    this.image = room.roomImg;
    this.initDirections(room);
    this.initItems(room);
  }

  private initDirections(room: DungeonRoomMetadata): void {
    const directions: RoomDirectionState = R.pickAll(['north', 'south', 'east', 'west', 'up', 'down'])(room);
    const dirs = R.reject((n: string) => R.isEmpty(n))(directions);
    const dirArray = R.pipe(R.toPairs, R.map(R.apply(R.objOf)))(dirs);
    this.directions = new Map();
    for (let dir of dirArray) {
      this.directions.set(Object.keys(dir)[0], Object.values(dir)[0]);
    }
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  private initItems(room: DungeonRoomMetadata): void {
    this.items = new Map();
    for (let item of room.items) {
      this.items.set(item.itemId, new Item(item));
    }
  }

  public getDirections(): Map<string, string> {
    return this.directions;
  }

  public removeItem(item: Item): boolean {
    return this.items.delete(item.getId());
  }

  public addItem(item: Item): void {
    this.items.set(item.getId(), item);
  }

  public getItems(): Map<string, Item> {
    return this.items;
  }

  public stringify(): any {
    const roomItems: any[] = [];
    this.items.forEach((value: Item, key: string) => {
      roomItems.push(value);
    });
    return { ...this, items: roomItems };
  }
}

export class Player {
  private id: string;
  private name: string;
  private startRoomId: string;
  private killCount: number;
  private currentRoomId: string;
  private inventory: Map<string, Item>;
  private history: Map<string, any>;

  constructor(id: string, name: string, startingRoomId: string) {
    this.id = id;
    this.name = name;
    this.startRoomId = startingRoomId;
    this.currentRoomId = startingRoomId;
    this.killCount = 0;
    this.inventory = new Map();
  }

  public getId(): string {
    return this.id;
  }

  public setName(name: string) {
    this.name = name;
  }

  public getInventory(): Map<string, Item> {
    return this.inventory;
  }

  public setCurrentRoomId(roomId: string): void {
    this.currentRoomId = roomId;
  }

  public getCurrentRoomId(): string {
    return this.currentRoomId;
  }

  public pickupItem(item: Item): void {
    this.inventory.set(item.getId(), item);
  }

  public dropItem(item: Item): boolean {
    return this.inventory.delete(item.getId());
  }

  public stringify(): any {
    const playerInventory: any[] = [];
    let gold: number = 0;
    this.inventory.forEach((item: Item, key: string) => {
      gold += +item.getValue();
      playerInventory.push(item);
    });
    return { ...this, gold, inventory: playerInventory };
  }
}

export class Underworld {
  private id: string;
  private name: string;
  private description: string;
  private helpText: string;
  private image: string;
  private allRooms: Map<string, Room>;
  private allItems: Map<string, Item>;
  private allPlayers: Map<string, Player>;

  constructor(dungeon: Dungeon) {
    const { dungeonId, dungeonName, dungeonDesc, dungeonImg, helpText, rooms } = dungeon;
    this.id = dungeonId;
    this.name = dungeonName;
    this.description = dungeonDesc;
    this.helpText = helpText;
    this.image = dungeonImg;
    this.allPlayers = new Map();
    this.initRooms(rooms);
    this.initItems(rooms);
  }

  private initRooms(rooms: Array<DungeonRoomMetadata>) {
    this.allRooms = new Map();
    for (let room of rooms) {
      this.allRooms.set(room.roomId, new Room(room));
    }
  }

  private initItems(rooms: Array<DungeonRoomMetadata>): void {
    this.allItems = new Map();
    for (let room of rooms) {
      for (let item of room.items) {
        this.allItems.set(item.itemId, new Item(item))
      }
    }
  }

  public getAllRooms(): Map<string, Room> {
    return this.allRooms;
  }

  public getAllItems(): Map<string, Item> {
    return this.allItems;
  }

  public getAllPlayers(): Map<string, Player> {
    return this.allPlayers;
  }

  public getRoom(roomId: string): Room {
    return this.allRooms.get(roomId);
  }

  public getRoomId(roomName: string): String {
    let roomId;
    this.allRooms.forEach((key: Room, value: string) => {
      if (key.getName() == roomName) roomId = value;
    });
    return roomId;
  }

  public getItem(itemId: string): Item {
    return this.allItems.get(itemId);
  }

  public addPlayer(player: Player): void {
    this.allPlayers.set(player.getId(), player);
  }

  public deletePlayer(playerId: string): boolean {
    return this.allPlayers.delete(playerId);
  }

  public getPlayer(playerId: string): Player {
    return this.allPlayers.get(playerId);
  }

  public findOrAddPlayer(playerId: string, playerName: string): Player {
    if (!this.allPlayers.has(playerId)) {
      // 'EXIT' room is the last room in array, so exclude it since player shouldn't start there
      const indx = Math.floor(Math.random() * this.allRooms.size - 1);
      const roomId = Array.from(this.allRooms.keys())[indx];
      const player = new Player(playerId, playerName, roomId)
      this.allPlayers.set(playerId, player);
      return player;
    } else {
      const player: Player = this.allPlayers.get(playerId);
      if (playerName) {
        // depending on Slack event, user name is unavailable during player creation
        player.setName(playerName);
      }
      return player;
    }
  }

  public stringify(): string {
    return JSON.stringify(this);
  }
}

export const UnderworldSingleton = (() => {
  let _instance: Underworld;

  const getInstance = (dungeon: Dungeon): Underworld => {
    if (!_instance) {
      _instance = new Underworld(dungeon);
      delete _instance.constructor; // no more instances
    }
    return _instance;
  }

  return {
    getInstance
  }
})();

export class MudGame {
  private underworld: Underworld;

  constructor(dungeon: Dungeon) {
    this.underworld = UnderworldSingleton.getInstance(dungeon);
  }

  public findOrAddPlayer(playerId: string, playerName: string = 'Unknown'): Player {
    return this.underworld.findOrAddPlayer(playerId, playerName);
  }

  public getPlayerById(playerId: string): Player {
    return this.underworld.getPlayer(playerId);
  }

  public getRoomById(roomId: string): Room {
    return this.underworld.getRoom(roomId);
  }

  public getItemById(itemId: string): Item {
    return this.underworld.getItem(itemId);
  }

  public enterRoom({ playerId, roomId }: PlayerRoomParam): void {
    const player: Player = this.underworld.getPlayer(playerId);
    player.setCurrentRoomId(roomId);
  }

  public pickupItem({ playerId, roomId, itemId }: PlayerRoomItemParam): void {
    const player: Player = this.underworld.getPlayer(playerId);
    const room: Room = this.underworld.getRoom(roomId);
    const item: Item = this.underworld.getItem(itemId);
    room.removeItem(item);
    player.pickupItem(item);
  }

  public dropItem({ playerId, roomId, itemId }: PlayerRoomItemParam): void {
    const player: Player = this.underworld.getPlayer(playerId);
    const room: Room = this.underworld.getRoom(roomId);
    const item: Item = this.underworld.getItem(itemId);
    room.addItem(item);
    player.dropItem(item);
  }

  public getPlayerJson(playerId: string): any {
    const player: Player = this.underworld.getPlayer(playerId);
    return player.stringify();
  }

  public getRoomJson(roomId: string): any {
    const room: Room = this.underworld.getRoom(roomId);
    const dirsMap: Map<string, string> = room.getDirections();
    const roomDirs: any[] = [];
    dirsMap.forEach((value: string, key: string) => {
      roomDirs.push({ direction: key, id: this.underworld.getRoomId(value), name: value });
    });
    return { ...room.stringify(), directions: roomDirs };
  }

  public getGameContext(playerId: string, playerName: string = 'Unknown'): any {
    const player: Player = this.underworld.findOrAddPlayer(playerId, playerName);
    const playerJson: any = this.getPlayerJson(playerId);
    const roomJson: any = this.getRoomJson(player.getCurrentRoomId());
    return { room: roomJson, player: playerJson };
  }
}