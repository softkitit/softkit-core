import { IsStringCombinedLocalized } from '@saas-buildkit/validation';

export class IdpMappingDto {
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  firstName!: string;
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  lastName!: string;
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  email!: string;
  @IsStringCombinedLocalized({
    minLength: 1,
    maxLength: 512,
  })
  role!: string;
}
