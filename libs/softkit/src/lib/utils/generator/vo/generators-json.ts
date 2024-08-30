export interface GeneratorsJsonEntry {
  hidden?: boolean;
  implementation: string;
  description?: string;
}

export interface GeneratorsJson {
  generators?: Record<string, GeneratorsJsonEntry>;
}
