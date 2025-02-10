import express from "express";
import {
  checkInController,
  checkOutController,
  getEmployeeAttendanceController,
  getNotifications,
} from "../controllers/attendanceControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

//user routes
router.post("/check-in", checkInController);

router.post("/check-out", checkOutController);

router.get("/employee-attendance", getEmployeeAttendanceController);

router.get("/notifications/:userId", getNotifications);

export default router;
