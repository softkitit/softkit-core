import { IsRequiredStringLocalized } from "@saas-buildkit/validation";

export class IdpMappingDto {
  @IsRequiredStringLocalized({
    minLength: 1,
    maxLength: 512,
  })
  firstName!: string;
  @IsRequiredStringLocalized({
    minLength: 1,
    maxLength: 512,
  })
  lastName!: string;
  @IsRequiredStringLocalized({
    minLength: 1,
    maxLength: 512,
  })
  email!: string;
  @IsRequiredStringLocalized({
    minLength: 1,
    maxLength: 512,
  })
  role!: string;
}
