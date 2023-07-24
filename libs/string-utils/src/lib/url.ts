export const decodeBase64StringObjectFromUrl = (
  str?: string,
): Record<string, unknown> => {
  if (str === undefined) {
    return {};
  }

  try {
    return JSON.parse(
      Buffer.from(decodeURIComponent(str), 'base64').toString('utf8'),
    );
  } catch {
    return {};
  }
};

export const encodeObjectToBase64ForUrl = (
  obj: Record<string, unknown>,
): string => {
  return encodeURIComponent(
    Buffer.from(JSON.stringify(obj), 'utf8').toString('base64'),
  );
};
