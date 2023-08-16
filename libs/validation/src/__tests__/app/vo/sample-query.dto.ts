import {
  IsIntegerStringCombinedLocalized,
  IsUUIDLocalized,
} from '../../../index';

export class SampleQueryParam {
  @IsIntegerStringCombinedLocalized()
  page!: number;

  @IsUUIDLocalized()
  uuid!: string;
}
