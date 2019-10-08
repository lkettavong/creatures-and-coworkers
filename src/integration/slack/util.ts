import * as R from 'ramda';
import moment from 'moment'

import {
    DungeonRoom,
    DungeonRoomMetadata,
    DungeonRoomState,
    RoomDirectionState,
    NavDirection,
    Dungeon,
    RoomItem,
    Player
} from './types'

// StatUtil deprecated...just dabbling with ramda
export class StateUtil {

    public static getRoomDirections = (room: DungeonRoom): any => {
        const directions: RoomDirectionState = R.pickAll(['north', 'south', 'east', 'west', 'up', 'down'])(room);
        const dirs = R.reject((n: string) => R.isEmpty(n))(directions);
        return R.pipe(R.toPairs, R.map(R.apply(R.objOf)))(dirs);
    }

    public static getRoomStateByName = (rooms: Array<DungeonRoom>, name: String): DungeonRoomState => {
        const dungeonRoom: DungeonRoom = R.filter(R.where({ roomName: R.equals(name) }))(rooms)[0];
        const roomMetadata: DungeonRoomMetadata = R.pickAll(['roomName', 'roomDesc', 'roomImg', 'items'])(dungeonRoom);
        return R.merge({ directions: StateUtil.getRoomDirections(dungeonRoom) }, roomMetadata);
    }

    public static getItemsFromAllRooms = (dungeon: Dungeon): Array<RoomItem> => {
        const { rooms } = dungeon;
        let allItems: Array<RoomItem> = [];
        for (let room of rooms) {
            allItems = R.concat(allItems, room.items);
        }
        return allItems;
    }

    public static getInventoryItems = (dungeon: Dungeon, itemNames: Array<string>): Array<RoomItem> => {
        const allItems = StateUtil.getItemsFromAllRooms(dungeon);
        let inventoryItems: Array<RoomItem> = [];
        for (let item of allItems) {
            if (R.includes(item.itemName, itemNames)) inventoryItems.push(item);
        }
        return inventoryItems;
    }

    public static getRoomItems = (dungeon: Dungeon, roomName: string) => {
        return R.filter(R.propEq('roomName', roomName))(dungeon.rooms)[0].items
    }

    public static getItem = (roomItems: Array<RoomItem>, itmName: string): RoomItem => {
        return JSON.parse(JSON.stringify(R.filter(R.propEq('itemName', itmName))(roomItems)[0]));
    }

    public static getRoomItem = (dungeon: Dungeon, roomName: string, itmName: string): RoomItem => {
        const roomItems = StateUtil.getRoomItems(dungeon, roomName);
        const item = R.filter(R.propEq('itemName', itmName))(roomItems);
        return JSON.parse(JSON.stringify(item))[0];
    }

    public static removeRoomItem = (dungeon: Dungeon, roomName: string, itemName: string): void => {
        let roomItems = StateUtil.getRoomItems(dungeon, roomName);
        for (let item of roomItems) {
            if (item.itemName === itemName) {
                roomItems = R.reject(R.propEq('itemName', itemName), roomItems);
                const indx = R.findIndex(R.propEq('roomName', roomName))(dungeon.rooms);
                dungeon.rooms[indx].items = roomItems;
                break;
            }
        }
    }
}

export class DecoratorUtil {
    public static getNavigationLabel = (direction: string) => {
        switch (direction) {
            case NavDirection.North:
                return 'n';
            case NavDirection.South:
                return 's';
            case NavDirection.East:
                return 'e';
            case NavDirection.West:
                return 'w';
            case NavDirection.Up:
                return 'u';
            case NavDirection.Down:
                return 'd';
            default:
                return '-';
        }
    }
}

//TODO: refine, make open source, add to NPM 'Ai' utility class collection
export const AiLogger = (() => {

    type LoggerConstructor = {
        name: string;
        color: string;
    }

    type FunctionParams = {
        header?: string;
        body?: any;
        msg?: any;
        color?: string;
        isOn?: boolean;
    }

    enum Color {
        Red = '\x1b[31m%s\x1b[0m',
        Green = '\x1b[32m%s\x1b[0m',
        Yellow = '\x1b[33m%s\x1b[0m',
        Blue = '\x1b[34m%s\x1b[0m',
        Cyan = '\x1b[35m%s\x1b[0m',
        LightBlue = '\x1b[36m%s\x1b[0m',
        White = '\x1b[37m%s\x1b[0m'
    }

    let _toggle: boolean = true;
    let _color: Color = Color.White;

    const _header = (header: string, color: string): void => {
        console.group(color, `\n***[ ${header} ]******************[ ${moment().format()} ]***`);
    }

    const _withHeader = (header: string, body: any, color: string): void => {
        _header(header, color);
        _stringify(body, color);
        _endGroup();
    }

    const _stringify = (body: any, color: string): void => {
        console.log(color, JSON.stringify(body));
        _endGroup();
    }

    const _tablize = (body: any): void => {
        try {
            console.table(JSON.parse(JSON.stringify(body)));
            _endGroup();
        } catch (error) {
            console.log(Color.Red, 'Error, cannot parse JSON!')
        }
    }

    const _trace = (msg: any, color: string): void => {
        _header('Tracing state', color);
        console.log(color, msg)
        _endGroup();
    }

    const _log = (...args: any[]): void => {
        _header('Tracing state', _color);
        for (let indx in args) {
            console.log(_color, `(${+indx + 1}) ${args[indx]}`)
        }
        _endGroup();
    }

    const _endGroup = (): void => {
        console.groupEnd();
        console.log();
    }

    const _blank = (): void => {
        console.log();
    }

    class StaticLogger {
        public static toggle = () => {
            _toggle = !_toggle;
        }

        public static header = ({ header, color, isOn = true }: FunctionParams): void => {
            if (_toggle && isOn) {
                _header(header, color || _color);
            }
        }

        public static withHeader = ({ header, body, color, isOn = true }: FunctionParams): void => {
            if (_toggle && isOn) _withHeader(header, body, color || _color);
        }

        public static stringify = (obj: any, color: string = undefined, isOn: boolean = true): void => {
            if (_toggle && isOn) _stringify(obj, color || _color);
        }

        public static tablize = ({ body, isOn = true }: FunctionParams): void => {
            if (_toggle && isOn) _tablize(body);
        }

        public static trace = ({ msg, color, isOn = true }: FunctionParams): void => {
            if (_toggle && isOn) _trace(msg, color || _color);
        }

        public static log = (...args: any[]): void => {
            if (_toggle) _log(...args);
        }
    };

    class Logger {
        private name: string;
        private color: string;
        private flick: boolean = true;

        constructor({ name = "AiLogger", color = Color.White }: LoggerConstructor) {
            this.name = name;
            this.color = color;
        }

        public toggle = (): void => {
            this.flick = !this.flick;
        }

        public header = ({ header, color, isOn = true }: FunctionParams): void => {
            if (this.flick && isOn) _header(header, color || this.color);
        }

        public withHeader = ({ header, body, color, isOn = true }: FunctionParams): void => {
            if (this.flick && isOn) _withHeader(header, body, color || this.color);
        }

        public stringify = (obj: any, color: string = undefined, isOn: boolean = true): void => {
            if (this.flick && isOn) _stringify(obj, color || this.color);
        }

        public tablize = ({ body, isOn = true }: FunctionParams): void => {
            if (this.flick && isOn) _tablize(body);
        }

        public log = (...args: any[]): void => {
            if (this.flick) {
                _header('Tracing state', this.color);
                for (let indx in args) {
                    console.log(this.color, `(${+indx + 1}) ${args[indx]}`)
                }
                _endGroup();
            }
        }
    }

    const instantiate = ({ name, color }: LoggerConstructor) => {
        return new Logger({ name, color });
    }

    return {
        Color,
        _: StaticLogger,
        red: () => { _color = Color.Red; return StaticLogger },
        green: () => { _color = Color.Green; return StaticLogger },
        yellow: () => { _color = Color.Yellow; return StaticLogger },
        blue: () => { _color = Color.Blue; return StaticLogger },
        cyan: () => { _color = Color.Cyan; return StaticLogger },
        lightblue: () => { _color = Color.LightBlue; return StaticLogger },
        white: () => { _color = Color.White; return StaticLogger },
        instantiate,
        makeRedLogger: (name?: string) => instantiate({ name, color: Color.Red }),
        makeGreenLogger: (name?: string) => instantiate({ name, color: Color.Green }),
        makeYellowLogger: (name?: string) => instantiate({ name, color: Color.Yellow }),
        makeBlueLogger: (name?: string) => instantiate({ name, color: Color.Blue }),
        makeCyanLogger: (name?: string) => instantiate({ name, color: Color.Cyan }),
        makeLightBlueLogger: (name?: string) => instantiate({ name, color: Color.LightBlue }),
        makeWhiteLogger: (name: string) => instantiate({ name, color: Color.White })
    }
})();
