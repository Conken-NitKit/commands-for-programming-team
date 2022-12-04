import fetch from 'node-fetch';

export abstract class SssApiClient {
  abstract fetchList<T>(targetId: string): Promise<T[] | undefined>;
}

export class SssApiClientImpl extends SssApiClient {
  private serverLink: string;

  constructor() {
    super();
    this.serverLink = 'https://api.sssapi.app';
  }

  async fetchList<T>(targetId: string) {
    if (!targetId) {
      return;
    }
    const targetUrl = `${this.serverLink}/${targetId}`;

    const response = await fetch(targetUrl);
    const data = (await response.json()) as T[];

    return data;
  }
}
