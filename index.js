require('dotenv').config();
const host = process.env.HOST;
const port = process.env.PORT;

const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const https = require('https');

const sequelize = require('./db/db');
const models = require('./models/models');

const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');

//middleware
app.use(cors());
app.use(express.json());
app.get('/remote-file', (req, res) => {
  https.get(
    'https://addons-sso.heroku.com/apps/f5a78384-5d9b-4141-bac0-8055b8118798/addons/6f45a1cd-25a9-4014-a594-a9a5d17239e3',
    remoteRes => {
      remoteRes.pipe(res);
    }
  );
});
app.use(fileUpload({}));
app.use('/api', router);

//Handler error, last middleware
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`App listening at http://${host}:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
};
start().then(() => console.log('Starting...'));
