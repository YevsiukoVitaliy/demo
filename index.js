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
  // You need to read the contents of the challenge file and send it as the response
  // The file should be located in the directory specified in the Certbot command
  // For example, if the challenge file for token 'abc123' is located at '/path/to/acme-challenge-directory/abc123',
  // you should read the contents of that file and send it as the response.
  // Here's a basic example assuming the challenge file is a text file:
  const challengeFileContent = 'contents-of-your-challenge-file-goes-here';
  res.send(challengeFileContent);
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
