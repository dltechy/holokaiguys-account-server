import { Session } from 'express-session';

export interface PassportSessionUser {
  id: string;
  tokens: {
    authorizationCode: string;
    bearerToken: string;
    expiresAt: string;
  }[];
}

export type PassportSession = Session & {
  passport: {
    user: PassportSessionUser;
  };
};
