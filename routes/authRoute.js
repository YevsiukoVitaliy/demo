const router = require("express").Router();
const passport = require("passport");
const { generateJwt } = require("../passport");

router.get("/login/success", async (req, res) => {
  try {
    if (req.user) {
      const token = await generateJwt(req.user.id, req.user.email, req.user.role);

      const { password, ...userWithoutPassword } = req.user;
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

router.get("/redirect", async (req, res) => {
  try {
    // Convert the user object to a JSON string and encode it as a query parameter
    const userParam = encodeURIComponent(JSON.stringify(req.user));

    // Make a GET request to the /login/success route with the userParam query parameter
    const response = await fetch(`https://nodejsclusters-115724-0.cloudclusters.net/auth/login/success?user=${userParam}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    });

    if (response.ok) {
      const resObject = await response.json(); // Parse the response body as JSON
      res.status(200).json(resObject); // Send the JSON response back to the client
    } else {
      throw new Error("Authentication failed!");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
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
    failureRedirect: "/login/failed",
  })
);

router.get("/microsoft", passport.authenticate("microsoft", { scope: ["openid", "profile", "email"] }));

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/facebook", passport.authenticate("facebook", { scope: ["openid", "profile", "email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
