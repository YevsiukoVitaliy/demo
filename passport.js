const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const { User, Basket } = require("./models/models");
const jwt = require('jsonwebtoken');


const GOOGLE_CLIENT_ID = "1075234256896-8jr9mpntls87d7kafmbs7jgm6qve49il.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const MICROSOFT_CLIENT_ID = "d2efcc8a-d865-4cf2-bd3b-ae4aa58d81bb";
const MICROSOFT_CLIENT_SECRET = "7Nb8Q~ZvW182hwrOUTwRnhh2U68CNyESpkhl.c2Z";
const FACEBOOK_APP_ID = "207933322242984";
const FACEBOOK_APP_SECRET = "00243e005980a2228a767f32b1a81313";
const SECRET_KEY = process.env.SECRET_KEY 

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, SECRET_KEY, {
    expiresIn: '24h',
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      try {
        const user = await User.findOne({ where: { email } });

        if (user) {
          done(null, user);
        } else {
          const newUser = await User.create({ email });
          const basket = await Basket.create({ userId: newUser.id });
          done(null, newUser);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: MICROSOFT_CLIENT_ID,
      clientSecret: MICROSOFT_CLIENT_SECRET,
      callbackURL: "/auth/microsoft/callback",
      scope: ['user.read'],
    },
    async (accessToken, refreshToken, profile, done) => { 
      const email = profile.emails[0].value;

      try {
        const user = await User.findOne({ where: { email } });

        if (user) {
          done(null, user);
        } else {
          const newUser = await User.create({ email });
          const basket = await Basket.create({ userId: newUser.id });
          done(null, newUser);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      try {
        const user = await User.findOne({ where: { email } });

        if (user) {
          done(null, user);
        } else {
          const newUser = await User.create({ email });
          const basket = await Basket.create({ userId: newUser.id });
          done(null, newUser);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = { passport, generateJwt };
