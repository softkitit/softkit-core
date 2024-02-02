import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  I18n,
  I18nContext,
  I18nLang,
  I18nService,
  I18nValidationExceptionFilter,
} from '../../../../';
import { I18nTranslations } from '../../generated/i18n.generated';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  exampleErrorFormatter,
  exampleResponseBodyFormatter,
} from '../examples/example.functions';
import { TestException, TestExceptionFilter } from '../filter/test.filter';
import { TestGuard } from '../guards/test.guard';
import { Hero, HeroById } from '../interfaces/hero.interface';
import { TestInterceptor } from '../interceptors/test.interceptor';

@Controller('hello')
@UseFilters(new TestExceptionFilter())
export class HelloController {
  private static readonly TEST_HELLO_KEY = 'test.HELLO';

  constructor(private i18n: I18nService<I18nTranslations>) {}

  @Get()
  hello(@I18nLang() lang: string): any {
    return this.i18n.translate(HelloController.TEST_HELLO_KEY, { lang });
  }

  @Get('/typed')
  helloTyped(@I18nLang() lang: string): string {
    return this.i18n.translate(HelloController.TEST_HELLO_KEY, { lang });
  }

  @Get('/index')
  @Render('index')
  index(): any {
    return { count: 1 };
  }

  @Get('/index2')
  @Render('index2')
  index2(): any {}

  @Get('/index3')
  @Render('index3')
  index3(): any {}

  @Get('/short')
  helloShort(@I18nLang() lang: string): any {
    return this.i18n.t(HelloController.TEST_HELLO_KEY, { lang });
  }

  @Get('/short/typed')
  helloShortTyped(@I18nLang() lang: string): string {
    return this.i18n.t(HelloController.TEST_HELLO_KEY, { lang });
  }

  @Get('/context')
  helloContext(@I18n() i18n: I18nContext<I18nTranslations>): any {
    return i18n.translate(HelloController.TEST_HELLO_KEY);
  }

  @Get('/context/typed')
  helloContextTyped(@I18n() i18n: I18nContext<I18nTranslations>): string {
    return i18n.translate(HelloController.TEST_HELLO_KEY);
  }

  @Get('/short/context')
  helloShortContext(@I18n() i18n: I18nContext<I18nTranslations>): any {
    return i18n.t(HelloController.TEST_HELLO_KEY);
  }

  @Get('/short/context/typed')
  helloShortContextTyped(@I18n() i18n: I18nContext<I18nTranslations>): string {
    return i18n.t(HelloController.TEST_HELLO_KEY);
  }

  @Get('/request-scope')
  helloRequestScope(): any {
    return I18nContext.current<I18nTranslations>().translate(
      HelloController.TEST_HELLO_KEY,
    );
  }

  @Get('/request-scope/additional-interceptor')
  @UseInterceptors(TestInterceptor)
  helloRequestScopeAdditionalInterceptor(): any {
    return I18nContext.current<I18nTranslations>().translate(
      HelloController.TEST_HELLO_KEY,
    );
  }

  @Get('/request-scope/typed')
  helloRequestScopeTyped(): string {
    return I18nContext.current<I18nTranslations>().translate(
      HelloController.TEST_HELLO_KEY,
    );
  }

  @Get('/short/request-scope')
  helloShortRequestScope(): any {
    return I18nContext.current<I18nTranslations>().t(
      HelloController.TEST_HELLO_KEY,
    );
  }

  @Get('/short/request-scope/typed')
  helloShortRequestScopeTyped(): string {
    return I18nContext.current<I18nTranslations>().t(
      HelloController.TEST_HELLO_KEY,
    );
  }

  @Get('/object')
  object(): any {
    return this.i18n.translate('test.set-up-password', {
      args: { username: 'KirillCherkalov' },
    });
  }

  @Get('/array')
  array(): any {
    return this.i18n.translate('test.ARRAY');
  }

  @Get('/plurarization')
  plurarization(@Query('count') count: string): any {
    return I18nContext.current<I18nTranslations>().translate(
      'test.day_interval',
      {
        args: { count: Number.parseInt(count) },
      },
    );
  }

  @Get('/nested')
  nested(@Query('username') username: string): any {
    return I18nContext.current<I18nTranslations>().translate('test.nested', {
      args: { username },
    });
  }

  @Get('/nested-no-args')
  nestedNoArgs(): any {
    return I18nContext.current<I18nTranslations>().translate(
      'test.nested-no-args',
    );
  }

  @Get('/deeply-nested')
  deeplyNested(@Query('count') count: number): any {
    return I18nContext.current<I18nTranslations>().translate(
      'test.nest1.nest2.nest3',
      {
        args: { count },
      },
    );
  }

  @Get('/guard')
  @UseGuards(TestGuard)
  guard(): any {
    return 'NO';
  }

  @Get('/exception')
  exception(): any {
    throw new TestException();
  }

  private static readonly THIS_ACTION_ADDS_NEW_USER =
    'This action adds a new user';

  @Post('/validation')
  @UseFilters(new I18nValidationExceptionFilter())
  validation(@Body() _: CreateUserDto): any {
    return HelloController.THIS_ACTION_ADDS_NEW_USER;
  }

  @Post('/validation-without-details')
  @UseFilters(new I18nValidationExceptionFilter({ detailedErrors: false }))
  validationWithoutDetails(@Body() _: CreateUserDto): any {
    return HelloController.THIS_ACTION_ADDS_NEW_USER;
  }

  @Post('/validation-with-custom-http-code')
  @UseFilters(new I18nValidationExceptionFilter({ errorHttpStatusCode: 422 }))
  validationWithCustomHttpCode(@Body() _: CreateUserDto): any {
    return HelloController.THIS_ACTION_ADDS_NEW_USER;
  }

  @Post('/validation-custom-formatter')
  @UseFilters(
    new I18nValidationExceptionFilter({
      errorFormatter: exampleErrorFormatter,
    }),
  )
  validationCustomFormatter(@Body() _: CreateUserDto): any {
    return HelloController.THIS_ACTION_ADDS_NEW_USER;
  }

  @Post('/validation-custom-response-body-formatter')
  @UseFilters(
    new I18nValidationExceptionFilter({
      responseBodyFormatter: exampleResponseBodyFormatter,
      errorFormatter: exampleErrorFormatter,
    }),
  )
  validationResponseBodyFormatter(@Body() _: CreateUserDto): any {
    return HelloController.THIS_ACTION_ADDS_NEW_USER;
  }

  @Post('/custom-validation')
  customValidation(@I18n() i18n: I18nContext<I18nTranslations>): any {
    const createUserDto = new CreateUserDto();
    return i18n.validate(createUserDto);
  }

  @GrpcMethod('HeroesService', 'FindOne')
  findOne(
    @Payload() data: HeroById,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Hero {
    const items = [
      {
        id: 1,
        name: i18n.t('test.set-up-password.heading', {
          args: { username: 'John' },
        }),
      },
      { id: 2, name: 'Doe' },
    ];
    const result = items.find(({ id }) => id === data.id);

    if (!result) {
      throw new Error('Hero did not found');
    }

    return result;
  }
}
