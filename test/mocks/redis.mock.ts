const RedisMock = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
}));

export default RedisMock;
