const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/login", (req, res) => {
    const message = req.query.message || ""; // Retrieve the message
    console.log("Message received:", message); // Log the message for debugging
    res.render("login", { errorMessage: [], message });
  });
  
  router.post("/login", (req, res) => {
    const { fid, password } = req.body;
   
    const query = "SELECT * FROM usertable WHERE fid = ?";
    db.query(query, [fid], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error during login.");
      }
  
      if (results.length === 0) {
        return res.render("login", { errorMessage: ["User not found."], message: null });
      }
  
      const user = results[0];
  
      const match = (password.trim() === user.password.trim());
      console.log(password.trim() === user.password.trim());
      if (match) {
        // Store user data in session
        req.session.user = { fid: user.fid, status: user.status };
  
        if (user.status === "admin") {
          res.redirect("/admin-home"); // Corrected path
        } else if(user.status === "active"){
          res.redirect("/user-home"); // Corrected path
        }else{
          res.redirect("/sub-admin-home"); // Corrected path
        }
      } else {
        res.render("login", { errorMessage: ["Invalid credentials."], message: null });
      }
    });
  });
  
  router.post("/change-password", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
  
    const { oldPassword, newPassword } = req.body;
    const fid = req.session.user.fid;
  
    const getUserQuery = "SELECT password FROM usertable WHERE fid = ?";
    db.query(getUserQuery, [fid], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (results.length === 0) return res.status(404).json({ success: false, message: "User not found" });
  
      const storedPassword = results[0].password.trim();
      if (storedPassword !== oldPassword.trim()) {
        return res.status(400).json({ success: false, message: "Old password is incorrect" });
      }
  
      const updatePasswordQuery = "UPDATE usertable SET password = ? WHERE fid = ?";
      db.query(updatePasswordQuery, [newPassword.trim(), fid], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error updating password" });
  
        res.json({ success: true });
      });
    });
  });
  
  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Error logging out.");
      res.redirect("/facultyleavesinfo/auth/login?message=logged out successfully");
      // Corrected path
    });
  });

  return router;
};
