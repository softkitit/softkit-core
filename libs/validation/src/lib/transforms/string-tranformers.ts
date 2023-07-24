import { TransformFnParams } from 'class-transformer';
import { Maybe } from "@saas-buildkit/common-types";

export const lowerCaseTransformer = (
  params: TransformFnParams,
): Maybe<string> => params.value?.toLowerCase().trim();
