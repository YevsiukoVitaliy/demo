const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    required: false,
    type: String,
  },
  twitterId: {
    required: false,
    type: String,
  },
  githubId: {
    required: false,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
});

const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
