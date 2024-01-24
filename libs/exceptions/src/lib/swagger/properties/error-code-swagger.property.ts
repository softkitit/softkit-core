import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const errorCodeSwaggerProperty = (...errorCodes: string[]) => {
  return {
    errorCode: {
      type: 'enum',
      enum: errorCodes,
    } as SchemaObject,
  };
};
