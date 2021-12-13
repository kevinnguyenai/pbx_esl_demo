/**
 * FreeSWITCH API.
 * @file: freeswitch-listener/apis/freeswitch.js
 */
import l from '../../common/logger';

const ESL = require('modesl');

const FreeswitchConfig = {
  ip: process.env.PBX_HOST || '127.0.0.1',
  port: process.env.PBX_PORT || '8021',
  password: process.env.PBX_PASS || 'ClueCon',
};

const Event = {
  Connection: {
    READY: 'esl::ready',
    CLOSED: 'esl::end',
    ERROR: 'error',
  },
  RECEIVED: 'esl::event::*::*',
};
const ALL_EVENTS = 'all';
const RESPONSE_SUCCESS = '+OK';
const DTMF_EVENTS = 'DTMF';
let connection = null;

export const connect = () => new Promise((resolve, reject) => {
  if (connection !== null && connection.connected()) {
    l.info('connection was established');
    resolve(connection);
  } else {
    // Opening new FreeSWITCH event socket connection...
    connection = new ESL.Connection(
      FreeswitchConfig.ip,
      FreeswitchConfig.port,
      FreeswitchConfig.password,
    );
    connection.on(Event.Connection.ERROR, () => {
      // Error connecting to FreeSWITCH!
      reject(new Error('Connection error'));
    });
    connection.on(Event.Connection.CLOSED, () => {
      // Connection to FreeSWITCH closed!
      reject(new Error('Connection closed'));
    });
    connection.on(Event.Connection.READY, () => {
      // Connection to FreeSWITCH established!
      l.info('new connection established');
      resolve(connection);
    });
  }
});

/**
 * Execute a FreeSWITCH command through Event Socket.
 * NOTE: The returned Promise is resolved no matter the response.
 *       Use executeWithOkResult if you are interested only in successful responses.
 *
 * @return The body of the response, or an error.
 */

export const execute = (callerIdNumber, command) => new Promise((resolve, reject) => {
  l.info(`[${callerIdNumber}] Executing command: ${command}`);
  connect()
    .then(conn => {
      conn.bgapi(command, response => {
        const responseBody = response.getBody();
        resolve(responseBody);
      });
    }).catch(error => {
      l.error(`[${callerIdNumber}] Error executing command '${command}': ${error}`);
      reject(error);
    });
});

const isSuccessfulResponse = response => response.indexOf(RESPONSE_SUCCESS) === 0;

/**
 * Execute a FreeSWITCH command through Event Socket.
 * NOTE: The returned Promise is resolved only if the response is successful.
 *
 * @return The body of the response, or an error.
 */
const executeWithOkResult = (callerIdNumber, command) => new Promise((resolve, reject) => {
  execute(callerIdNumber, command)
    .then(response => {
      if (isSuccessfulResponse(response)) {
        l.info(`[${callerIdNumber}] Command '${command}' executed successfully: ${response.trim()}`);
        resolve(response);
      } else {
        l.error(`[${callerIdNumber}] Error executing command '${command}': ${response.trim()}`);
        reject(response);
      }
    })
    .catch(error => {
      reject(error);
    });
});

exports.ALL_EVENTS = ALL_EVENTS;
exports.DTMF_EVENTS = DTMF_EVENTS;
exports.Event = Event;
exports.connect = connect;
exports.execute = execute;
exports.executeWithOKResult = executeWithOkResult;
