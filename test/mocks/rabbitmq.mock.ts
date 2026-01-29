export const RabbitMQMock = {
  publish: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue(undefined),
  emit: jest.fn().mockResolvedValue(undefined),
  consume: jest.fn(),
  connect: jest.fn(),
  close: jest.fn(),
};
