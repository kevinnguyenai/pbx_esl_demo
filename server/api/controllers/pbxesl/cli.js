import l from '../../../common/logger';
import {
  sofiaStatus,
  reloadXml,
} from '../../services/pbx-esl.service';

export class Controller {
  cliSofiaStatus(req, res) {
    sofiaStatus()
      .then(response => { res.status(200).json({ success: true, description: 'command successful', data: response }); })
      .catch(err => res.status(404).send({ success: false, description: 'not found', data: err }));
  }

  cliReloadXml(req, res) {
    reloadXml()
      .then(response => { res.status(200).json({ success: true, description: 'command successful', data: response }); })
      .catch(err => res.status(404).send({ success: false, description: 'not found', data: err }));
  }
}

export default new Controller();
