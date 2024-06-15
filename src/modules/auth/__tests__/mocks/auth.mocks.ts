export const authServiceMock = {
  createDiscordLoginState: jest.fn(),
  getRedirectUrl: jest.fn(),
  token: jest.fn(),
  logout: jest.fn(),
  userinfo: jest.fn(),
};

export const discordAuthGuardMock = {
  canActivate: jest.fn(),
};

export const bearerAuthGuardMock = {
  canActivate: jest.fn(),
};
