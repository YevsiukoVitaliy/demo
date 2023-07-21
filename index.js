const cookieSession = require("cookie-session");
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passportSetup = require("./passport");
const passport = require("passport");
const fileUpload = require('express-fileupload');
const path = require('path');
const httpProxy = require('http-proxy');

const sequelize = require('./db/db');
const models = require('./models/models');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const authRoute = require("./routes/authRoute");
const app = express();
const host = process.env.HOST;
const port = process.env.PORT;
const httpServer = require('http').createServer(app);

app.use(
  cookieSession({ name: "session", keys: [process.env.SECRET_KEY ], maxAge: 24 * 60 * 60 * 100 })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

// middleware
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.all('*', (req, res) => {
      proxy.web(req, res, { target: 'https://nodejsclusters-115724-0.cloudclusters.net' });
    });

    httpServer.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
    });
  } catch (e) {
    console.error(e);
  }
};

start().then(() => console.log('Starting...'));
