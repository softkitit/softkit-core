import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from '../interfaces';

@Injectable()
export class GraphQLWebsocketResolver implements I18nResolver {
  async resolve(
    context: ExecutionContext,
  ): Promise<string | string[] | undefined> {
    switch (context.getType() as string) {
      case 'graphql': {
        const { connectionParams } = context.getArgs()[2];
        return connectionParams?.lang;
      }
    }

    return undefined;
  }
}
