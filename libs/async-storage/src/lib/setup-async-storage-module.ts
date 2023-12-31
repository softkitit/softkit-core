import { ClsModule, ClsModuleOptions } from 'nestjs-cls';
import { FastifyRequest } from 'fastify';

export function setupClsModule(clsOptions?: ClsModuleOptions) {
  return ClsModule.forRoot({
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (req: FastifyRequest) => req.id.toString(),
    },
    ...clsOptions,
  });
}
