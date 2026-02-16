import type { Socket } from 'socket.io-client';

const ioMock = jest.fn();

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

// Mock env
jest.mock('../config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api',
}));

describe('socket module', () => {
  beforeEach(() => {
    jest.resetModules();
    ioMock.mockReset();
  });

  it('getSocket() creates singleton with base URL derived from API_BASE_URL and correct options', async () => {
    const fakeSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    const s1 = mod.getSocket();
    const s2 = mod.getSocket();

    expect(s1).toBe(fakeSocket);
    expect(s2).toBe(fakeSocket);

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith('http://localhost:4000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: false,
    });
  });

  it('getSocket() does not strip base URL if it does not end with /api', async () => {
    jest.doMock('../config/env', () => ({
      API_BASE_URL: 'https://example.com/v1',
    }));

    const fakeSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    mod.getSocket();

    expect(ioMock).toHaveBeenCalledWith('https://example.com/v1', expect.any(Object));
  });

  it('connectSocket() connects when not connected', async () => {
    const fakeSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    const s = mod.connectSocket();

    expect(s).toBe(fakeSocket);
    expect(fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it('connectSocket() does not connect when already connected', async () => {
    const fakeSocket = {
      connected: true,
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    mod.connectSocket();

    expect(fakeSocket.connect).not.toHaveBeenCalled();
  });

  it('disconnectSocket() does nothing if socket is not initialized', async () => {
    const mod = await import('../socket-client.service');
    expect(() => mod.disconnectSocket()).not.toThrow();
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('disconnectSocket() disconnects when initialized', async () => {
    const fakeSocket = {
      connected: true,
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    mod.getSocket(); // initialize singleton
    mod.disconnectSocket();

    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnectSocket() swallows disconnect errors', async () => {
    const fakeSocket = {
      connected: true,
      connect: jest.fn(),
      disconnect: jest.fn(() => {
        throw new Error('boom');
      }),
    } as unknown as Socket;

    ioMock.mockReturnValue(fakeSocket);

    const mod = await import('../socket-client.service');
    mod.getSocket(); // initialize singleton

    expect(() => mod.disconnectSocket()).not.toThrow();
    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
  });
});
