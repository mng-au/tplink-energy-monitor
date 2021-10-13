import { Client, Plug } from 'tplink-smarthome-api';
import * as os from 'os';

export class DeviceManager {
  private readonly _clients: Client[];
  private readonly _devices: Plug[];

  constructor() {
    this._clients = [];
    this._devices = [];
  }

  get devices() {
    return [...this._devices];
  }

  start() {
    const interfaces = os.networkInterfaces();

    Object.entries(interfaces)
      .filter((x): x is [string, os.NetworkInterfaceInfo[]] => Boolean(x))
      .map(([_, list]) => list)
      .flat()
      .filter((i) => i.family === 'IPv4' && !i.internal)
      .map((i) => i.address)
      .map((addr) => this.startDiscovery(addr));
  }

  startDiscovery(bindAddress: string) {
    console.log('Starting discovery on interface: ' + bindAddress);
    const client = new Client();
    client.on('plug-new', this.registerPlug.bind(this));
    client.startDiscovery({
      deviceTypes: ['plug'],
      address: bindAddress,
      discoveryTimeout: 20000,
    });
    this._clients.push(client);
  }

  registerPlug(plug: Plug) {
    if (plug.supportsEmeter) {
      if (this._devices.find(d => d.deviceId === plug.deviceId)) {
        return;
      }

      console.log(
        `Found device with energy monitor support: ${plug.alias} [${plug.deviceId}]`
      );

      this._devices.push(plug);
    } else {
      console.log(
        `Skipping device: ${plug.alias} [${plug.deviceId}]. Energy monitoring not supported.`
      );
    }
  }
}
