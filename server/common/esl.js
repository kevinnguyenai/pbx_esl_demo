/* eslint-disable one-var */
/* eslint-disable global-require */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import l from './logger';

const fsServer = process.env.PBX_HOST;
const fsPort = process.env.PBX_PORT;
const fsPass = process.env.PBX_PASS;
const fsEsl = require('esl');

// io.enable('browser client minification');
// io.enable('browser client etag');
// io.enable('browser client gzip');
// io.set('log level', 1);
// io.set('transports', [
//  'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling',
// ]);

export function fsConnect(socket, cmd, callbackFunc, args) {
  fsConnClosed(socket);
  socket.fsClient = fsEsl.createClient();
  socket.fsClient.on('close', () => { fsConnClosed(socket); });

  socket.fsClient.on('esl_auth_request', callbackObj => callbackObj.auth(fsPass, callbackObj => {
    socket.fsConn = callbackObj;
    fsCommand(socket, cmd, callbackFunc, args);
  }));

  return socket.fsClient.connect(fsPort, fsServer);
}

export function fsConnClosed(socket) {
  if (socket.fsClient) {
    socket.fsClient.end();
  }
  socket.fsConn = false;
  socket.fsClient = false;
}

export function fsCommand(socket, cmd, callbackFunc, args) {
  if (!socket.fsConn || !socket.fsClient) {
    fsConnect(socket, cmd, callbackFunc, args);
  } else {
    socket.fsConn.api(cmd, callback => {
      // console.log('text:' + callback.body);
      if (callbackFunc) {
        l.info(cmd);
        callbackFunc(callback.body, socket, args);
      }
    });
  }
}

export function parseStrToArray(textToParse, columnDelimiter, returnNameValPairs) {
  let headers;
  let line;
  let name;
  let nameValPair;
  const headerLines = textToParse.split('\n');
  if (returnNameValPairs) {
    headers = {};
  } else {
    headers = [];
  }
  for (let i = 0; i < headerLines.length; i++) {
    if (returnNameValPairs) {
      nameValPair = headerLines[i].split(columnDelimiter, 2);
      headers[nameValPair[0]] = nameValPair[1];
    } else {
      headers[i] = headerLines[i].split(columnDelimiter);
    }
  }
  if (returnNameValPairs && headers['Reply-Text'] && headers['Reply-Text'][0] === '%') {
    for (name in headers) {
      headers[name] = querystring.unescape(headers[name]);
    }
  }
  return headers;
}

export function parseUuids(responseStr, socket, messageObj) {
  const uuidArr = parseStrToArray(responseStr, ',', false);
  // more code here...
}

export default (
  parseStrToArray,
  parseUuids,
  fsConnect,
  fsConnClosed,
  fsCommand
);
