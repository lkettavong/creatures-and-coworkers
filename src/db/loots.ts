export type Loot = {
  value: number
} & Record<
  | 'id'
  | 'user_id'
  | 'name'
  | 'property'
  | 'description'
  | 'created_at'
  | 'deleted_at'
, string>;
