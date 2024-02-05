import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from '../interfaces';
import { GqlContextType } from '@nestjs/graphql';

@Injectable()
export class GraphQLWebsocketResolver implements I18nResolver {
  async resolve(
    context: ExecutionContext,
  ): Promise<string | string[] | undefined> {
    const contextType = context.getType<GqlContextType>();

    if (contextType === 'graphql') {
      const { connectionParams } = context.getArgs()[2];
      return connectionParams?.lang;
    }

    return undefined;
  }
}
