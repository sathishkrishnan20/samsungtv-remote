import {Buffer} from '@craftzdog/react-native-buffer';
import {Configuration, WSData, App, Command} from './types';
import {KEYS} from './keys';
import {AsyncStorage} from 'react-native';
import {
  base64,
  chr,
  getVideoId,
  getMsgInstalledApp,
  getMsgAppIcon,
  getMsgLaunchApp,
  getCommandByKey,
  getSendTextCommand,
} from './helpers';
class Samsung {
  private IP: string;
  private MAC: string;
  private PORT: number;
  private APP_STRING: string;
  private TV_APP_STRING: string;
  private TOKEN: string;
  private NAME_APP: string;
  private SAVE_TOKEN: boolean;
  private TOKEN_FILE = 'token'; // path.join(__dirname, 'token.txt')
  private WS_URL: string;
  private ws: WebSocket;
  constructor(config: Configuration) {
    if (!config.ip) {
      throw new Error('You must provide IP in config');
    }

    if (!config.mac) {
      throw new Error('You must provide MAC in config');
    }
    this.IP = config.ip;
    this.MAC = config.mac;
    this.PORT = Number(config.port) || 8002;
    this.TOKEN = config.token || '';
    this.NAME_APP = Buffer.from(config.nameApp || 'NodeJS Remote').toString(
      'base64',
    );
    this.SAVE_TOKEN = config.saveToken || false;
    // legacy 55000
    this.APP_STRING = config.appString || 'iphone..iapp.samsung';
    this.TV_APP_STRING = config.tvAppString || 'iphone.UE40NU7400.iapp.samsung';
    this.WS_URL = this._getWSUrl();
  }

  public async turnOn(): Promise<boolean> {
    try {
      // await WOL.wake({mac: this.MAC});
      console.log('WOL sent command to TV', '', 'turnOn');
      return true;
    } catch (err) {
      console.error('Fail turn on', err, 'turnOn');
      return false;
    }
  }

  public isAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch(
        `http://${this.IP}:8001${
          this.PORT === 55000 ? '/ms/1.0/' : '/api/v2/'
        }`,
        {
          method: 'GET',
        },
      )
        .then(async res => {
          console.log(
            'TV is available',
            {
              request: await res.json(),
              code: res.status,
              statusText: res.statusText,
            },
            'isAvailable',
          );
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  async getToken() {
    console.log('Token ', this.TOKEN);
    const savedToken = await AsyncStorage.getItem(this.TOKEN);
    console.log('Is token saave', this.SAVE_TOKEN);
    if (this.SAVE_TOKEN && savedToken) {
      this.TOKEN = savedToken;
      this.WS_URL = this._getWSUrl();
      return this.TOKEN;
    }
    /*
    this.sendKey(KEYS.KEY_HOME, (err, res) => {
      if (err) {
        console.error('after sendKey', err, 'getToken');
        throw new Error('Error send Key');
      }
      console.log('Send Key Resp');
      console.log(res);
      const token =
        (res &&
          typeof res !== 'string' &&
          res.data &&
          res.data.token &&
          res.data.token) ||
        null;
      if (token !== null) {
        const sToken = String(token);
        console.log('got token', sToken, 'getToken');
        this.TOKEN = sToken;
        this.WS_URL = this._getWSUrl();

        if (this.SAVE_TOKEN) {
          this._saveTokenToFile(sToken);
        }
        return token;
      }
    });
    */
  }
  private async _saveTokenToFile(token: string) {
    try {
      await AsyncStorage.setItem(this.TOKEN_FILE, token);
      console.log('Token Saved', token);
    } catch (err) {
      console.log('File error!');
      console.error('catch fil esave', {err}, '_saveTokenToFile');
    }
  }
  public sendKey(
    key: KEYS,
    done?: (
      err: Error | {code: string} | null,
      res: WSData | string | null,
    ) => void,
  ) {
    console.log('send key', key, 'sendKey');
    if (this.PORT === 55000) {
      // this._sendLegacy(key, done);
    } else {
      this._send(getCommandByKey(key), done, 'ms.channel.connect');
    }
  }
  private _send(
    command: Command,
    done?: (err: null | (Error & {code: string}), res: WSData | null) => void,
    eventHandle?: string,
  ) {
    console.log('command', command, '_send');
    console.log('wsUrl', this.WS_URL, '_send');

    this.ws.onopen = () => {
      if (this.PORT === 8001) {
        setTimeout(() => this.ws.send(JSON.stringify(command)), 1000);
      } else {
        this.ws.send(JSON.stringify(command));
      }
    };

    this.ws.onmessage = message => {
      console.log('On Message');
      console.log(message);
      const data: WSData = JSON.parse(message.data);

      console.log('data: ', JSON.stringify(data, null, 2), 'ws.on message');

      if (
        done &&
        (data.event === command.params.event || data.event === eventHandle)
      ) {
        console.log(
          'if correct event',
          JSON.stringify(data, null, 2),
          'ws.on message',
        );
        done(null, data);
      }

      if (data.event !== 'ms.channel.connect') {
        console.log(
          'if not correct event',
          JSON.stringify(data, null, 2),
          'ws.on message',
        );
        this.ws.close();
      }

      // TODO, additional check on available instead of ws.open
      // if(data.event == "ms.channel.connect") { _sendCMD() }
    };

    // ws.on (response: WebSocket.Data) => {
    //   console.log('response', response, 'ws.on response');
    // });
    this.ws.onerror = err => {
      console.log('On Error');
      console.log(err);
      // ws.onerror = (err: Error & {code: string}) => {
      //   let errorMsg = '';
      //   if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
      //     errorMsg = 'TV is off or unavailable';
      //   }
      //   console.error(errorMsg);
      //   console.error(errorMsg, err, 'ws.on error');
      //   if (done) {
      //     done(err, null);
      //   }
    };
  }
  private _getWSUrl() {
    const url = `${this.PORT === 8001 ? 'ws' : 'wss'}://${this.IP}:${
      this.PORT
    }/api/v2/channels/samsung.remote.control?name=${this.NAME_APP}${
      this.TOKEN !== '' ? `&token=${this.TOKEN}` : ''
    }`;
    this.ws = new WebSocket(url);
    return url;
  }
}
export default Samsung;
