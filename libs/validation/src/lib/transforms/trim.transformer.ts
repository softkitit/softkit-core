import { Transform, TransformFnParams } from 'class-transformer';

export const trimTransformer = (
  params: TransformFnParams,
): string | undefined => params.value?.trim();

export const Trim = Transform(trimTransformer);
