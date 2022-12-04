import qs from 'querystring';

import axios from 'axios';

export abstract class LineNotifyClient {
  abstract notifyMessage(message: string): void;
}

export class LineNotifyClientImpl extends LineNotifyClient {
  private serverLink: string;
  private authorization: string;

  constructor(_token: string) {
    super();
    const token = _token;

    this.serverLink = 'https://notify-api.line.me/api/notify';
    this.authorization = token ? `Bearer ${token}` : '';
  }

  notifyMessage(message: string) {
    if (!message) {
      return;
    }

    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.authorization,
      },
    };

    axios.post(this.serverLink, qs.stringify({ message }), options);
  }
}
