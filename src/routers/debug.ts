import Router from 'koa-router';
const router = new Router();
router.prefix('/debug');

router.get('/', async ctx => {
  ctx.body = 'Hello, World!';
});

export default router;
