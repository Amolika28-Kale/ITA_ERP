const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ita-erp.netlify.app"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));


app.listen(5000, () => console.log("Server running"));
