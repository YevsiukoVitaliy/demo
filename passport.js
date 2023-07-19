const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const { User } = require("./models/models");

const GOOGLE_CLIENT_ID = "1075234256896-8jr9mpntls87d7kafmbs7jgm6qve49il.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const MICROSOFT_CLIENT_ID = "d2efcc8a-d865-4cf2-bd3b-ae4aa58d81bb";
const MICROSOFT_CLIENT_SECRET = "7Nb8Q~ZvW182hwrOUTwRnhh2U68CNyESpkhl.c2Z";
const FACEBOOK_APP_ID = "207933322242984";
const FACEBOOK_APP_SECRET = "00243e005980a2228a767f32b1a81313";

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
    function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0].value;
      User.findOne({ where: { email } })
        .then(user => {
          if (user) {
            done(null, user);
          } else {
            User.create({ email })
              .then(newUser => {
                done(null, newUser);
              })
              .catch(err => {
                done(err);
              });
          }
        })
        .catch(err => {
          done(err);
        });
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
