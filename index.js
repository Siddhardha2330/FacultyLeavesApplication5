const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");

// Import database connection
const db = require("./db"); // Replace with the correct path to your DB setup file

// Import route modules

const userRoutes = require("./routes/userRoutes")(db); // User routes
const authRoutes = require("./routes/authRoutes")(db); // Authentication routes
const adminRoutes = require("./routes/adminRoutes")(db); // Admin routes
const leaveRoutes = require("./routes/leaveRoutes")(db); // Leave-related routes
const fileUploadRoutes = require("./routes/fileUploadRoutes")(db); // File upload routes
const admin2 = require("./routes/admin2")(db); 
// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Configuration
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge:86400000, // 1 hour (in milliseconds)
    }
  })
);

// Static Files

// View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Custom Middleware for Session Check
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Base Router with Prefix `/facultyleavesinfo`
const baseRouter = express.Router();

// Attach individual route modules under `/facultyleavesinfo`
baseRouter.use("/auth", authRoutes); // For example: /facultyleavesinfo/auth/login
baseRouter.use("/admin", adminRoutes); // For example: /facultyleavesinfo/admin/home
baseRouter.use("/leaves", leaveRoutes); // For example: /facultyleavesinfo/leaves/apply
baseRouter.use("/fileupload", fileUploadRoutes); // For example: /facultyleavesinfo/fileupload
baseRouter.use("/user", userRoutes);
baseRouter.use("/admin2", admin2); // For example: /facultyleavesinfo/user/profile

// Default Route for `/facultyleavesinfo` to show the login page

// Mount the base router
app.use("/facultyleavesinfo", baseRouter);

app.get("/facultyleavesinfo", (req, res) => {
  res.redirect("/facultyleavesinfo/auth/login"); // Redirect to login page
});
app.get("/admin-leave-success", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/admin-leave-success"); // Redirect to login page
});
app.get("/admin-leave", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/admin-apply-leave"); // Redirect to login page
});
app.get("/facultyleavesinfo/login", (req, res) => {
  res.redirect("/facultyleavesinfo/auth/login"); // Redirect to login page
});
app.get("/login", (req, res) => {
  res.redirect("/facultyleavesinfo/auth/login"); // Redirect to login page
});
app.get("/fileupload", (req, res) => {
  res.redirect("/facultyleavesinfo/fileupload/fileupload"); // Redirect to login page
});
app.get("/add-user", (req, res) => {
  res.redirect("/facultyleavesinfo/admin/add-user"); // Redirect to login page
});
app.get("/sub-admin-home", (req, res) => {
  res.redirect("/facultyleavesinfo/admin2/sub-admin"); // Redirect to login page
});
app.get("/filter-leaves", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/filter-leaves");
});
app.get("/view-leave-applications", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/view-leave-applications");
});
app.get("/apply-leave", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/apply-leave");
});
app.get("/admin-home", (req, res) => {
  res.redirect("/facultyleavesinfo/admin/admin-home");
});
// Additional GET route for `/home` functionality in user module
app.get("/user-home", (req, res) => {
  res.redirect("/facultyleavesinfo/user/user-home");
});
app.get("/dateWise", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/dateWise");
});
app.get("/monthWise", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/monthWise");
});
app.get("/custom", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/custom");
});
app.get("/yearWise", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/yearWise");
});
app.get("/consolidated", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/consolidated");
});
app.get("/leave-success", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/leave-success");
});
app.get("/api/search-faculty", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/api/search-faculty");
});
app.get("/api/faculty-leaves", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/api/faculty-leaves");
});
app.get("/api/get-leave-details", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/api/get-leave-details");
});
app.get("/delete", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/delete");
});
app.get("/faculty-reports", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/faculty-reports");
});


app.get("/api/search-faculty-leave", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/api/search-faculty-leave");
});
app.get("/api/faculty-leave-data", (req, res) => {
  res.redirect("/facultyleavesinfo/leaves/api/faculty-leave-data");
});
app.get("/logout",(req, res) => {
  res.redirect("/facultyleavesinfo/auth/logout");
});
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});
// Error Handling
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Start Server
const PORT = 80;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
