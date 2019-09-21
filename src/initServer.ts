import Knex from 'knex';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import * as routers from './routers';
import knexConfig from '../knexfile';

const logUrl: Koa.Middleware = async (ctx, next) => {
  console.log(`URL: ${ctx.url}`);
  await next();
};

const serverMiddleware = [
  bodyParser(),
  logUrl
];

export default (): Koa => {
  const server = new Koa();

  server.context.db = Knex(knexConfig['development']);

  serverMiddleware.forEach(middleware => server.use(middleware));
  Object.values(routers).forEach(router => server.use(router.routes()));

  return server;
};
