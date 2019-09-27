import * as R from 'ramda';
import Knex from 'knex';
import { DungeonEvent } from '../stateReconstructor/events';
import { gatherJoin, dissolveJoin } from './utils';
import { EventDetails } from './event_details';
import { match } from '../stateReconstructor/unionHelpers';

export type Event = Record<
  | 'id'
  | 'dungeon_id'
  | 'user_id'
  | 'type'
  | 'created_at'
, string>;

export const gatherEvents = async (db: Knex) => {
  const res = await db<Event>('events')
    .leftJoin<EventDetails>('event_details', 'events.id', 'event_details.event_id')
    .select({
      user_id: 'user_id',
      type: 'type',
      event_id: 'events.id',
      name: 'name',
      value: 'value'
    })
    .orderBy('events.created_at', 'asc');

  const gatherEventJoin = gatherJoin<DungeonEvent, typeof res[0]>(
    'event_id',
    (evt: DungeonEvent, details) => {
      if (!details.value) {
        return {
          ...evt,
          kind: details.type as any,
          playerId: details.user_id,
        };
      }

      return {
        ...evt,
        kind: details.type as any,        // This is a cheat, we're just trusting that details.type
        playerId: details.user_id,        // is among the set of allowed kinds
        [details.name]: details.value
      };
    }
  );

  return gatherEventJoin(res);
};

export const saveEvents = (db: Knex, user_id: string, dungeon_id: string) => async (events: DungeonEvent[]) => {
  type Evt = Partial<Event>;
  type EvtDet = Partial<EventDetails>;

  return Promise.all(events.map(async (evt) => {
    const detailsRecords: EvtDet[] = match<DungeonEvent, EvtDet[]>({
      'move': ({direction}) => [
        {name: 'direction', value: `"${direction}"`}
      ],
      'pick-up': ({itemId}) => [
        {name: 'itemId', value: itemId}
      ],
      'stab': () => [],
      'drop-in': ({dungeonId}) => [
        {name: 'dungeonId', value: `"${dungeonId}"`}
      ]
    })(evt);

    const trx = await db.transaction();

    try {
      const [event_id] = await trx('events')
        .insert({
          dungeon_id, user_id, type: evt.kind
        }, 'id');

      await trx('event_details')
        .insert(detailsRecords.map(evtDet => ({
          ...evtDet,
          event_id
        })));

      await trx.commit();

      return event_id;
    } catch (e) {
      console.log('Error insert event/event_details:', e);
      await trx.rollback();
      throw e;
    }
  }));
};