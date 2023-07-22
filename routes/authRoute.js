const router = require("express").Router();
const passport = require("passport");
const { generateJwt } = require("../passport");

// Добавляем функцию для выполнения fetch-запроса
const fetchUserData = async () => {
  try {
    const response = await fetch('https://nodejsclusters-115724-0.cloudclusters.net/auth/login/success');
    // Проверяем, успешен ли запрос (статус 200-299)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Перевыбрасываем ошибку, чтобы её можно было обработать вне этой функции
  }
};

// Внутри вашего роутера вызываем функцию fetchUserData
router.get("/login/success", async (req, res) => {
  try {
    if (req.user) {
      const token = await generateJwt(req.user.id, req.user.email, req.user.role);

      const { password, ...userWithoutPassword } = req.user;

      // Вызываем функцию fetchUserData для получения данных
      const userData = await fetchUserData();

      // Кодирование данных, полученных из fetch-запроса
      const { dataField1, dataField2 } = userData;

      res.status(200).json({
        success: true,
        message: "successfull",
        user: userWithoutPassword,
        token: token,
        dataField1, // Включаем полученные данные в ответ на роутере
        dataField2,
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
