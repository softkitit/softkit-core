import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from '../interfaces';

@Injectable()
export class GraphQLWebsocketResolver implements I18nResolver {
  async resolve(
    context: ExecutionContext,
  ): Promise<string | string[] | undefined> {
    if (context.getType().toString() === 'graphql') {
      const { connectionParams } = context.getArgs()[2];
      return connectionParams?.lang;
    }
  }
}
