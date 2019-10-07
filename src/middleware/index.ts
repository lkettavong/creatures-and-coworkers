import * as user from './user';
import * as dungeon from './dungeon';

export const establishStateMiddlewares = [
  user.withUser,
  dungeon.withCurrentDungeon,
  dungeon.withCurrentDungeonTemplate,
  dungeon.withAutoParticipation,
  dungeon.withRebuiltState,
];
