export const usersServiceMock = {
  getMany: jest.fn(),
  getById: jest.fn(),
  getByDiscordId: jest.fn(),
  getByDiscordUsername: jest.fn(),
  updateSuperAdminState: jest.fn(),
  delete: jest.fn(),
};

export const usersDaoMock = {
  create: jest.fn(),
  getMany: jest.fn(),
  getById: jest.fn(),
  getByDiscordId: jest.fn(),
  getByDiscordUsername: jest.fn(),
  updateSuperAdminState: jest.fn(),
  updateDiscordInfo: jest.fn(),
  delete: jest.fn(),
};
