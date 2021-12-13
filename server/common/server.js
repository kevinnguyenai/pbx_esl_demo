/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
import Express from 'express';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as os from 'os';
import * as OpenApiValidator from 'express-openapi-validator';
import * as esl from './fsesl';

import l from './logger';
import errorHandler from '../api/middlewares/error.handler';

const app = new Express();

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);

    const apiSpec = path.join(__dirname, 'api.yml');
    const validateResponses = !!(
      process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION
      && process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
    );

    // CORE
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));
    // esl engine
    // OpenAPI Specs
    app.use(process.env.OPENAPI_SPEC || '/spec', Express.static(apiSpec));
    app.use(
      OpenApiValidator.middleware({
        apiSpec,
        validateResponses,
        ignorePaths: /.*\/spec(\/|$)/,
      }),
    );
  }

  router(routes) {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = p => () => l.info(
      `up and running in ${process.env.NODE_ENV
          || 'development'} @: ${os.hostname()} on port: ${p}}`,
    );
    // define express erver
    const server = http.createServer(app);
    // http.createServer(app).listen(port, welcome(port));
    // add socket server
    const io = require('socket.io')(server);
    // asign server to port
    server.listen(port, welcome(port));
    return app;
  }

}
/* automatic connect to freeswitch esl and subcribe event 
const sockets = () => esl.connect()
  .then(connection => {
    connection.subscribe(esl.ALL_EVENTS);
    connection.on(esl.Event.RECEIVED, rawEvent => {
      l.info(rawEvent);
    });
  })
  .catch(err => {
    l.error(`Error connecting to FreeSWITCH by ${err} . Retrying in 10000 millis...`);
    setTimeout(sockets, 10000);
  });
sockets();
*/
