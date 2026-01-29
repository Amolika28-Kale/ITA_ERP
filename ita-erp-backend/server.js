const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ita-erp.netlify.app",
    "https://lemonchiffon-cormorant-334193.hostingersite.com",
    "https://indiantradersacademy.in"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
const passport = require("passport");
require("./config/passport");

app.use(passport.initialize());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/attendance", require("./routes/attendenceRoutes"));
app.use("/api/admin", require("./routes/adminAttendanceRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/requirements", require("./routes/requirementRoutes"));
app.use("/api/payments", require("./routes/paymentCollectionRoutes"));

app.listen(5000, () => console.log("Server running"));
