const express = require("express");

module.exports = (db) => {
  const router = express.Router(); // Move router inside the function

  function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
      return res.redirect("/login?message=Please log in to continue.");
    }
    next();
  }

  router.get("/sub-admin", ensureLoggedIn, (req, res) => {
    res.render("admin2-home");
  });

  return router;
};
