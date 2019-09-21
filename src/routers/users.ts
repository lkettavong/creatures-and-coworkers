import Router from 'koa-router';
const router = new Router();
router.prefix('/users');

router.get('/', async ctx => {
  const { db } = ctx;
  const { rows: results } = await db.raw('select * from users;');
  ctx.body = results;
});

export default router;

