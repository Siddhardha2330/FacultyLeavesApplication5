const express = require("express");
const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login?message=Please log in to continue.");
  next();
}

module.exports = (db) => {
  router.get("/user-home", ensureLoggedIn, (req, res) => {
    if (!req.session.user) {
       return res.redirect("/login");
     }
   
     const { fid } = req.session.user;
     const message = req.session.message || ""; // Retrieve the message
   
     // Clear the message after retrieval
     req.session.message = null;
   
     const facultyQuery = "SELECT * FROM facultytable WHERE fid = ?";
   
     db.query(facultyQuery, [fid], (err, facultyResults) => {
       if (err) return res.status(500).send("Error fetching faculty data.");
   
       res.render("user-home", {
         faculty: facultyResults[0],
         message, // Pass the message to the view
       });
     });
   });

  return router;
};
