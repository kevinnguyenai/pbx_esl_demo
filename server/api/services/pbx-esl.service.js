// import * as fsw from '../../common/esl';
import faker from 'faker';
import l from '../../common/logger';

const fsesl = require('./fs-esl.service');

const Event = {
  Connection: {
    READY: 'esl::ready',
    CLOSED: 'esl::end',
    ERROR: 'error',
  },
  RECEIVED: 'esl::event::*::*',
};

export const sofiaStatus = () => new Promise((resolve, reject) => {
  fsesl.connect()
    .then(conn => {
      fsesl.execute(faker.datatype.uuid(), 'sofia status')
        .then(result => {
          const totalresult = result.split('\n', 100);
          const lastresult = totalresult.map(str => str.split('\t'))
            .filter(item => item.length === 4)
            .map(item => item.map(its => its.trim()))
            .filter((item, index) => index > 0);
          const ras = [];
          lastresult.forEach(item => {
            ras.push({Name: item[0], Type: item[1], Data: item[2], State: item[3] });
          });
          // l.info(ras);
          conn.disconnect();
          resolve(ras);
        })
        .catch(err => reject(err));
    });
});

export const reloadXml = () => new Promise((resolve, reject) => {
  fsesl.connect()
    .then(conn => {
      fsesl.execute(faker.datatype.uuid(), 'reloadxml')
        .then(result => {
          conn.disconnect();
          resolve(result);
        })
        .catch(err => {
          conn.disconnect();
          reject(err);
        });
    })
    .catch(error => reject(error));
});

export const Click2CallInternal = args => new Promise((resolve, reject) => {
  fsesl.connect()
    .then(conn => {
      // conn.subscribe('all');

      fsesl.execute(faker.datatype.uuid(), `originate {origination_caller_id_number=${args.from}}user/${args.from}@${args.domain} &bridge({origination_caller_id_number=${args.to}}user/${args.to}@${args.domain})`)
        .then(res => {
          if (res.includes('-ERR')) {
            conn.disconnect();
            reject(res);
          } else if (res.includes('+OK')) {
            const resCallId = res.split(' ')[1].trim();
            l.info(resCallId);
            conn.disconnect();
            resolve(resCallId);
          }
        })
        .catch(err => { reject(err); });

      conn.on(Event.RECEIVED, rawEvent => {
        // l.debug(rawEvent);
        if (rawEvent.Type === 'BACKGROUND_JOB') {
          const jobUUID = rawEvent.headers.filter(item => item.name === 'Job-UUID');
          l.info(`{"name": "BACKGOUND_JOB","Job-UUID": ${jobUUID}`);
        }
      });
    })
    .catch(error => reject(error));
});

export default (
  sofiaStatus,
  reloadXml,
  Click2CallInternal
);
