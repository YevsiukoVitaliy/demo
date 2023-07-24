// const https = require('https');
// const fs = require('fs');
// const cookieSession = require('cookie-session');
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const passportSetup = require('./passport');
// const passport = require('passport');
// const fileUpload = require('express-fileupload');
// const path = require('path');

// const sequelize = require('./db/db');
// const models = require('./models/models');
// const router = require('./routes/index');
// const errorHandler = require('./middleware/ErrorHandlingMiddleware');
// const authRoute = require('./routes/authRoute');
// const app = express();
// const host = process.env.HOST;
// const port = process.env.PORT;

// app.use(
//   cookieSession({ name: 'session', keys: [process.env.SECRET_KEY], maxAge: 24 * 60 * 60 * 100 })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     methods: 'GET,POST,PUT,DELETE',
//     credentials: true,
//   })
// );

// app.use('/auth', authRoute);

// app.use(express.json());
// app.use(express.static(path.resolve(__dirname, 'static')));
// app.use(fileUpload({}));
// app.use('/api', router);

// app.use(errorHandler);

// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')), 
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')), 
// };

// const httpsServer = https.createServer(sslOptions, app);

// const start = async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();

//     httpsServer.listen(port, host, () => {
//       console.log(`Сервер работает на хосте ${httpsServer.address().address}`);
//     });
//   } catch (e) {
//     console.error(e);
//   }
// };


// start().then(() => console.log('Starting...'));

const http = require('http'); 
const cookieSession = require('cookie-session');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passportSetup = require('./passport');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const path = require('path');

const sequelize = require('./db/db');
const models = require('./models/models');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const authRoute = require('./routes/authRoute');
const app = express();
const host = process.env.HOST;
const port = process.env.PORT;


app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
  })
);

app.set('trust proxy', 1);

app.use(
  cookieSession({ name: 'session', keys: [process.env.SECRET_KEY], maxAge: 24 * 60 * 60 * 100 })
);

app.use('/auth', authRoute);

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);


app.use(passport.initialize());
app.use(passport.session());

// Удалите блок с опциями SSL, так как мы не используем HTTPS
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')), 
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')), 
// };

// const httpsServer = https.createServer(sslOptions, app);

const httpServer = http.createServer(app); 

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    httpServer.listen(port, host, () => {
      console.log(`Сервер работает на хосте ${httpServer.address().address}`);
    });
  } catch (e) {
    console.error(e);
  }
};

start().then(() => console.log('Starting...'));
