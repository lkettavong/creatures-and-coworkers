import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import * as routers from './routers';

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

  serverMiddleware.forEach(middleware => server.use(middleware));
  Object.values(routers).forEach(router => server.use(router.routes()));

  return server;
};
