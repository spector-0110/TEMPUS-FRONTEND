export class ServerConnectionError extends Error {
  constructor(message = 'Unable to connect to server') {
    super(message);
    this.name = 'ServerConnectionError';
  }
}
