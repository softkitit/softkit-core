export function toCapitalizedWords(name?: string): string {
  if (name === undefined) {
    return '';
  }

  const words = name.toLowerCase().match(/[A-Za-z][a-z]*/g) || [];
  return words.map(capitalize).join(' ');
}

export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
