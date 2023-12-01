import { Transform, TransformFnParams } from 'class-transformer';

export const trimAndLowercaseTransformer = (
  params: TransformFnParams,
): string | string[] | undefined => {
  if (Array.isArray(params.value)) {
    return params.value.map((item) => item.toLowerCase().trim());
  }

  return params.value?.toLowerCase().trim();
};

export const TrimAndLowercase = Transform(trimAndLowercaseTransformer);
