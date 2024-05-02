export const authServiceMock = {
  getDiscordLoginState: jest.fn(),
  getRedirectUrl: jest.fn(),
  logout: jest.fn(),
  userinfo: jest.fn(),
};

export const discordAuthGuardMock = {
  canActivate: jest.fn(),
};

export const authGuardMock = {
  canActivate: jest.fn(),
};
