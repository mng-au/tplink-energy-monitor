import * as express from 'express';
import { Plug } from 'tplink-smarthome-api';
import { DeviceManager } from '../services/device-manager';

interface EMeterResponse {
  [k: string]: number;
  voltage_mv: number;
  current_ma: number;
  power_mw: number;
  total_wh: number;
  err_code: number;
  current: number;
  power: number;
  total: number;
  voltage: number;
}

const sortDevices = (devices: Plug[]) => {
  return devices.slice().sort((a, b) => {
    return a.alias.toLowerCase().localeCompare(b.alias.toLowerCase());
  });
};

// /*
// * On older firmware versions (not sure exactly which since its not documented anywhere)
// * voltage seems to be reported as its peak to peak value, not RMS.
// * So we show the RMS value since thats what would you expect to see.
// * i.e. 220v not 310v (in the U.K).
// * This is applied for all 1.0.x firmware versions.
// */
const normaliseVoltage = (response: EMeterResponse, device: Plug) => {
  if (device.softwareVersion.startsWith('1.0')) {
    return response.voltage / Math.sqrt(2);
  } else {
    return response.voltage;
  }
};

export default (devMgr: DeviceManager) => {
  const indexRouter = express.Router();

  indexRouter.get('/', async (req, res) => {
    res.redirect('/api/v1/plugs');
  });

  indexRouter.get('/api/v1/plugs', async (req, res) => {
    let devices = sortDevices(devMgr.devices);

    let content = '';

    const dt = Date.now();

    for (const device of devices) {
      const response = (await device.emeter.getRealtime()) as EMeterResponse;

      response.voltage = normaliseVoltage(response, device);

      Object.keys(response).forEach((key) => {
        const value = response[key];
        content += `tplink_plug_${key}{chart="tplink_plug.${device.alias}", family="${device.alias}", dimension="${key}"} ${value} ${dt}\n`;
      });
    }

    res.contentType('text/plain');
    res.send(content);
  });

  return indexRouter;
};
