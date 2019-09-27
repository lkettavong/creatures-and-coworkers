import * as Knex from "knex";
import { Template } from "../templates";

// import ForsakenGoblinTemplate from '../../templates/ForsakenGoblin.json';
// import TestTower from '../../templates/TestTower.json';

export async function seed(knex: Knex): Promise<any> {
  const templates = [
    require('../../templates/ForsakenGoblin.json'),
    require('../../templates/TestTower.json')
  ];

  const insertQuery = knex<Template>('templates')
    .insert(templates.map(tmpl => ({
      name: tmpl.dungeonName,
      model: JSON.stringify(tmpl)
    })))
    .toString();

  return knex.raw(`${insertQuery} ON CONFLICT DO NOTHING RETURNING *;`);
};
