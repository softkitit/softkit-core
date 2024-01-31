import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CatService } from './cat.service';
import { Inject, UseFilters } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CreateCatInput } from './cat.input';
import { I18nService } from '../../../services/i18n.service';
import { I18nContext } from '../../../i18n.context';
import { I18n } from '../../../decorators';
import { I18nValidationExceptionFilter } from '../../../filters/i18n-validation-exception.filter';

@Resolver('Cat')
export class CatResolver {
  constructor(
    private readonly catService: CatService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query('cats')
  async getCats() {
    return await this.catService.findAll();
  }

  @Query('cat')
  async getCat(@Args('id') id: number) {
    return await this.catService.findById(id);
  }

  @Query('catUsingContext')
  async getCatUsingContext(@Args('id') id: number, @I18n() i18n: I18nContext) {
    const cat = await this.catService.findById(id);
    // we manually overwrite this property to indicate a value that is translated!
    cat.description = i18n.translate('test.cat');
    return cat;
  }

  @Mutation('createCat')
  async create(@Args('createCatInput') args: CreateCatInput): Promise<any> {
    await this.pubSub.publish('catAdded', { catAdded: args.name });
    return args;
  }

  @Subscription('catAdded', {
    resolve: async (payload: any, _: any, ctx: any) => {
      const { catAdded } = payload;
      const i18nService: I18nService = ctx.i18nService;

      return i18nService.translate('test.cat_name', {
        lang: ctx.i18nLang,
        args: { name: catAdded },
      });
    },
  })
  catAdded() {
    return this.pubSub.asyncIterator('catAdded');
  }

  @Mutation('validation')
  @UseFilters(new I18nValidationExceptionFilter())
  validation(@Args('createCatInput') _: CreateCatInput) {
    return;
  }
}
