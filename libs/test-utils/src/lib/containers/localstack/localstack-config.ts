export type LocalstackStartedConfig = {
  ports: { [key in number]: number };
  mainPort: number;
  host: string;
};
