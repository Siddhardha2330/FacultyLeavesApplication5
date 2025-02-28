const express = require("express");
const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login?message=Please log in to continue.");
  next();
}

module.exports = (db) => {
  router.get("/admin-home", ensureLoggedIn, (req, res) => {
    res.render("admin-home");
  });

  router.get("/add-user", ensureLoggedIn, (req, res) => {
    res.render("add-user", { message: [] });
  });

  router.post("/add-user", (req, res) => {
    const {
      fid, name, password, status, dateofjoining, email, mobile, cl, sl, el, scl,designation
    } = req.body;
  
    
  
    const facultyQuery = `
      INSERT INTO facultytable (fid, fname, dateofjoining, email, mobile, cl, sl, el, scl,designation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;
  
    const userQuery = `
      INSERT INTO usertable (fid, password, status)
      VALUES (?, ?, ?)
    `;
  
    // Try inserting into the faculty table
    db.query(
      facultyQuery,
      [fid, name, dateofjoining, email, mobile, cl, sl, el, scl,designation],
      (err) => {
        let message = {};
  
        if (err) {
          console.error("Error inserting into facultytable:", err);
  
          // Check for specific errors (e.g., duplicate Faculty ID)
          if (err.code === 'ER_DUP_ENTRY') {
            message.text = `Error: Faculty ID ${fid} already exists. Please choose a different Faculty ID.`;
          } else {
            message.text = `Error adding to faculty table: ${err.message}`;
          }
          message.type = "danger";
          return res.render("add-user", { message });
        }
  
        // If faculty insertion is successful, insert into user table
        db.query(userQuery, [fid, password, status], (err) => {
          if (err) {
            console.error("Error inserting into usertable:", err);
  
            // Check for specific errors (e.g., unique constraint violation)
            if (err.code === 'ER_DUP_ENTRY') {
              message.text = `Error: User with Faculty ID ${fid} already exists.`;
            } else {
              message.text = `Error adding to user table: ${err.message}`;
            }
            message.type = "danger";
            return res.render("add-user", { message });
          }
  
          // If both insertions are successful
          message.text = "User added successfully!";
          message.type = "success";
          return res.render("add-user", { message });
        });
      }
    );
  });
  return router;
};
