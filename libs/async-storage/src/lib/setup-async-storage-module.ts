import { ClsModule, ClsModuleOptions } from 'nestjs-cls';

export function setupClsModule(clsOptions?: ClsModuleOptions) {
  return ClsModule.forRoot({
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (req) => req.id.toString(),
    },
    ...clsOptions,
  });
}
