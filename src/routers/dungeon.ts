import Router from 'koa-router';
import ForsakeGoblinTemplate from '../templates/ForsakenGoblin.json';
import { reduceState } from '../stateReconstructor';
import { Move, PickUp, Stab } from '../stateReconstructor/events';
import { DungeonState } from '../stateReconstructor/dungeonState';
const router = new Router();
router.prefix('/dungeon');

const forsakenGoblinTemple = DungeonState(ForsakeGoblinTemplate);
const findPlayer = (dungeonState: DungeonState, id: number) => dungeonState.players.filter(player => player.id === id)[0];
const viewRoom = (dungeonState: DungeonState, playerRoom: string) => dungeonState.rooms.filter(room => room.roomName === playerRoom)[0];

router.get('/', async ctx => {
  ctx.body = ForsakeGoblinTemplate;
});

router.get('/look', async ctx => {
  const playerRoom = findPlayer(forsakenGoblinTemple, 1).room;
  ctx.body = viewRoom(forsakenGoblinTemple, playerRoom);
});

router.get('/move/:direction', async ctx => {
  //Create Move event
  //in order:
  // - pull event logs, run reduceState across them
  // - call effector with that state + Move event to get array of effects
  // - do those effects
  // - save Move to events table
  
  const updatedState = reduceState(forsakenGoblinTemple)(Move({
    playerId: 1, direction: ctx.params.direction
  }));
  const playerRoom = findPlayer(updatedState, 1).room;
  forsakenGoblinTemple.players[0].room = playerRoom;
  ctx.body = viewRoom(forsakenGoblinTemple, playerRoom);
});

export default router;


