import { ClsModule } from "nestjs-cls";
import { FastifyRequest } from 'fastify';

export function setupClsModule() {
  ClsModule.forRoot({
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (req: FastifyRequest) => req.id.toString(),
    },
  });
}
