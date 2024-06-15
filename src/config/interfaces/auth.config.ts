export interface AuthConfig {
  cookieSecret: string;
  sessionSecret: string;
  sessionCookieMaxAge: number;
  isUsingProxy: boolean;
  isSessionCookieSecure: boolean;
  loginStateTtlSeconds: number;
}
