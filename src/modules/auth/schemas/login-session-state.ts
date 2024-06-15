export interface LoginSessionState {
  [key: string]: {
    successRedirectUrl: string;
    failRedirectUrl: string;
  };
}
