export type EventDetails = {
  value: unknown
} & Record<
  | 'id'
  | 'event_id'
  | 'name'
  | 'created_at'
  | 'deleted_at'
, string>;
