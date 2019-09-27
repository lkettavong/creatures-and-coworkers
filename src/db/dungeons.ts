export type Dungeon = {
  is_active: boolean
} & Record<
  | 'id'
  | 'template_id'
, string>;
