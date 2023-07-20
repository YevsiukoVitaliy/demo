const cookieSession = require("cookie-session");
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passportSetup = require("./passport");
const passport = require("passport");
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs'); // Import the fs module to read the challenge file

const sequelize = require('./db/db');
const models = require('./models/models');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const authRoute = require("./routes/authRoute");
const app = express();
const host = process.env.HOST;
const port = process.env.PORT;

app.use(
  cookieSession({ name: "session", keys: [process.env.SECRET_KEY], maxAge: 24 * 60 * 60 * 100 })
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

// Handler for ACME challenge
app.get('/.well-known/acme-challenge/:acmeToken', (req, res) => {
  const acmeToken = req.params.acmeToken;
  const challengeFile = path.join(__dirname, '.well-known', 'acme-challenge', acmeToken);
  
  // Read the contents of the challenge file
  fs.readFile(challengeFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading challenge file');
    } else {
      // Send the challenge file content as the response
      res.send(data);
    }
  });
});

// Handler error, last middleware
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(process.env.CLIENT_URL);
    });
  } catch (e) {
    console.error(e);
  }
};
start().then(() => console.log('Starting...'));
