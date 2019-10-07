import { Context } from 'koa';

export const namespace = '_cnc';
export const updateCNCMiddlewareNamespace = (ctx: Context, properties: Object) => {
  return {
    ...ctx[namespace],
    ...properties
  };
};
