import * as express from 'express';
import cli from './cli';
import call from './call';

export default express
  .Router()
  .get('/cli/sofiastatus', cli.cliSofiaStatus)
  .get('/cli/reloadxml', cli.cliReloadXml)
  .post('/call/extension', call.callClick2CallInternal);
