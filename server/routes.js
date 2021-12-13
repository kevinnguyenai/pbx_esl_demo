import examplesRouter from './api/controllers/examples/router';
import cliRouter from './api/controllers/pbxesl/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/pbx', cliRouter);
}
