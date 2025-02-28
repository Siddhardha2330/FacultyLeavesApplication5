const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
// Import your database connection
const multer = require("multer");
 // Middleware to check if the user is logged in

// Configure Multer for file upload
const upload = multer({
  dest: "uploads/",
});
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login?message=Please log in to continue.");
  next();
}
module.exports = (db) => {
// Function to insert data from Excel file into the database
const insertDataFromExcel = (filePath, req) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const messages = req.session.messages || []; // Reference session messages

  data.forEach((row) => {
    const { fid, fname, dateofjoining, designation, email, mobile, cl, sl, el, scl } = row;

    const parsedCL = parseFloat(cl) || 0;
    const parsedSL = parseFloat(sl) || 0;
    const parsedEL = parseFloat(el) || 0;
    const parsedSCL = parseFloat(scl) || 0;

    let formattedDateOfJoining = null;
    if (typeof dateofjoining === "number") {
      const jsDate = new Date((dateofjoining - 25569) * 86400 * 1000);
      formattedDateOfJoining = jsDate.toISOString().split("T")[0];
    } else if (typeof dateofjoining === "string" && dateofjoining.includes("-")) {
      const [day, month, year] = dateofjoining.split("-");
      formattedDateOfJoining = `${year}-${month}-${day}`;
    } else {
      messages.push({ text: `Invalid date format for FID ${fid}`, type: "error" });
      return;
    }

    const checkFIDQuery = "SELECT fid FROM facultytable WHERE fid = ?";
    db.query(checkFIDQuery, [fid], (err, results) => {
      if (err) {
        messages.push({ text: `Error checking FID ${fid}: ${err.message}`, type: "error" });
        return;
      }

      if (results.length > 0) {
        const updateLeaveTypesQuery = `
          UPDATE facultytable
          SET cl = ?, sl = ?, el = ?, scl = ?
          WHERE fid = ?
        `;
        db.query(updateLeaveTypesQuery, [parsedCL, parsedSL, parsedEL, parsedSCL, fid], (err) => {
          if (err) {
            messages.push({ text: `Error updating FID ${fid}: ${err.message}`, type: "error" });
          } else {
            messages.push({ text: `Leave types updated for FID ${fid}.`, type: "success" });
          }
        });
      } else {
        const insertFacultyQuery = `
          INSERT INTO facultytable (fid, fname, dateofjoining, designation, email, mobile, cl, sl, el, scl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertUserQuery = `
          INSERT INTO usertable (fid, password, status)
          VALUES (?, ?, ?)
        `;

        db.query(insertFacultyQuery, [
          fid, fname, formattedDateOfJoining, designation, email, mobile, parsedCL, parsedSL, parsedEL, parsedSCL,
        ], (err) => {
          if (err) {
            messages.push({ text: `Error inserting FID ${fid}: ${err.message}`, type: "error" });
          } else {
            messages.push({ text: `Faculty ID ${fid} added successfully.`, type: "success" });

            db.query(insertUserQuery, [fid, "svecwit", "active"], (err) => {
              if (err) {
                messages.push({ text: `Error creating user for FID ${fid}: ${err.message}`, type: "error" });
              } else {
                messages.push({ text: `User account created for FID ${fid}.`, type: "success" });
              }
            });
          }
        });
      }
    });
  });

  // Save messages back to session
  req.session.messages = messages;
};
router.get("/fileupload", ensureLoggedIn, (req, res) => {
  const messages = req.session.messages || [];
  req.session.messages = [];
  res.render("fileupload", { messages });
});

// Route to handle file upload
router.post("/upload", upload.single("excelFile"), (req, res) => {
  if (!req.file) {
    req.session.messages = req.session.messages || [];
    req.session.messages.push({ text: "No file uploaded. Please upload a valid Excel file.", type: "error" });
    return res.redirect("/fileupload");
  }

  const filePath = req.file.path;

  try {
    insertDataFromExcel(filePath, req);
    req.session.messages = req.session.messages || [];
    req.session.messages.push({ text: "File uploaded successfully, and data has been updated!", type: "success" });
  } catch (err) {
    console.error("Error processing the file:", err);
    req.session.messages = req.session.messages || [];
    req.session.messages.push({ text: "An error occurred while processing the file. Please try again.", type: "error" });
  }

  res.redirect("/fileupload");
});
return router;
}
