const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// config/passport.js मध्ये बदल
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production"
        ? "https://ita-erp.onrender.com/api/auth/google/callback"
        : "http://localhost:5000/api/auth/google/callback",
      passReqToCallback: true,
      // ✅ scope इथे न लिहिता route मध्ये लिहिणे चांगले आहे, पण इथेही अपडेट करा
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true,
            isActive: true,
            provider: "google",
            role: "employee",
            googleAccessToken: accessToken, // ✅ स्टोअर करा
            googleRefreshToken: refreshToken // ✅ स्टोअर करा
          });
        } else {
          // ✅ जर युजर आधीच असेल, तर त्याचे टोकन्स अपडेट करा
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
