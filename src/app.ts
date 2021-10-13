import { DeviceManager } from './services/device-manager';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';

const devMgr = new DeviceManager();
devMgr.start();

const app = express();
import indexRouter from './routes';
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter(devMgr));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(process.env.PORT || '3000');
