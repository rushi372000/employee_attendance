import express from "express";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
import connectDB from "./config/database.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sendEmail from "./utils/sendEmail.js";
import cron from "./utils/notifications.js";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

//COnnect with database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use(express.static(path.join(__dirname, "/client/dist")));

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/dist/index.html"));  
}
);

//Port
const PORT = process.env.PORT || 8080;

// sendEmail("rsw372@gmail.com", "Test Email", "This is a test email");
app.listen(PORT, async() => {
  
  // console.log(
  //   `Server is running on port ${PORT}`.bgCyan
  //     .white
  // );
});
