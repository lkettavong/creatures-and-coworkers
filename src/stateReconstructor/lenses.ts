import * as R from 'ramda';
import { lensFind, lensCompose } from '../util/lens';

// type LensObj = {
//   [s: string]: (...params: any[]) => R.Lens
// };

export const lenses = {
  player: (playerId: string): R.Lens => lensCompose(
    lenses.players(),
    lensFind(R.whereEq({id: playerId}))
  ),
  room: (roomName: string): R.Lens => lensCompose(
    R.lensPath(['rooms']),
    lensFind(R.whereEq({roomName}))
  ),
  players: (): R.Lens => R.lensPath(['players']),
  deadPlayers: (): R.Lens => R.lensPath(['deadPlayers']),
  firstRoom: (): R.Lens => lensCompose(
    R.lensPath(['rooms']),
    R.lensIndex(0)
  ),
  playerRoomName: (playerId: string): R.Lens => lensCompose(
    lenses.player(playerId),
    R.lensPath(['room'])
  ),
  playerInventory: (playerId: string): R.Lens => lensCompose(
    lenses.player(playerId),
    R.lensPath(['inventory'])
  ),
  playerGold: (playerId: string): R.Lens => lensCompose(
    lenses.player(playerId),
    R.lensPath(['gold'])
  )
};
