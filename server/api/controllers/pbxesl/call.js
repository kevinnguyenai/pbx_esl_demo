import l from '../../../common/logger';
import {
  Click2CallInternal,
} from '../../services/pbx-esl.service';

export class Controller {
  callClick2CallInternal(req, res) {
    const args = {
      from: req.body.from,
      to: req.body.to,
      domain: req.body.domain,
    };
    l.debug(`request body is ${args}`);
    Click2CallInternal(args)
      .then(response => {
        res.status(200).send({ success: true, description: 'call successful', data: response });
      })
      .catch(err => {
        res.status(404).send({ success: false, description: 'call fail', data: err });
      });
  }
}

export default new Controller();
