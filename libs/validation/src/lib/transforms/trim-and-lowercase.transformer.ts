import { TransformFnParams } from 'class-transformer';

export const trimAndLowercaseTransformer = (
  params: TransformFnParams,
): string | undefined => params.value?.toLowerCase().trim();
