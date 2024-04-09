export interface AppConfig {
  nodeEnv: string;
  port: number;
  name?: string;
  corsOrigin?: (string | RegExp)[];
  baseUrl?: string;
}
