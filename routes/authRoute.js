const router = require("express").Router();
const passport = require("passport");
const { generateJwt } = require("../passport");

router.get("/redirect", (req, res) => {
res.send('sdasad')

});

router.get("/login/success", async (req, res) => {
  try {
    // Retrieve the user object from the query parameter
    const userParam = req.query.user;
    const user = JSON.parse(decodeURIComponent(userParam));

    if (user) {
      const token = await generateJwt(user.id, user.email, user.role);

      const { password, ...userWithoutPassword } = user;
      res.status(200).json({
        success: true,
        message: "successfull",
        user: userWithoutPassword,
        token: token, 
      });
    } else {
      res.status(401).json({
        success: false,
        message: "failure",
      });
    }
  } catch (error) {
    console.error("Error generating JWT:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["openid", "profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "https://nodejsclusters-115724-0.cloudclusters.net/auth/login/failed",
  })
);

router.get("/microsoft", passport.authenticate("microsoft", { scope: ["openid", "profile", "email"] }));

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "https://nodejsclusters-115724-0.cloudclusters.net/auth/login/failed",
  })
);

router.get("/facebook", passport.authenticate("facebook", { scope: ["openid", "profile", "email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "https://nodejsclusters-115724-0.cloudclusters.net/auth/login/failed",
  })
);

module.exports = router;
