import { MudGame } from './model';
import { Dungeon } from './types';

export const DungeonMaster = (() => {
  let _instance: MudGame;

  const getInstance = (dungeon: Dungeon): MudGame => {
    if (!_instance) {
      _instance = new MudGame(dungeon);
      delete _instance.constructor; // allow just one instance
    }
    return _instance;
  }

  return {
    getInstance
  }
})();