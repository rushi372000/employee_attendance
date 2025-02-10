import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllEmployeeAttendanceController,
  updateAttendanceController,
  deleteAttendanceController,
  getAllUsersController,
  updateUserController,
  deleteUserController,
  getAllUsers,
  getFilteredAttendance,
  exportAttendanceReport,
} from "../controllers/adminControllers.js";

const router = express.Router();

router.use(protect);

//----------admin routes--------------
router.get("/all-attendance", isAdmin, getAllEmployeeAttendanceController);

// Update Attendance Record
router.put("/attendance/:id", isAdmin, updateAttendanceController);

// Delete Attendance Record
router.delete("/attendance/:id", isAdmin, deleteAttendanceController);

// Get All Users
router.get("/users", isAdmin, getAllUsersController);

// Update User
router.put("/users/:id", isAdmin, updateUserController);

// Delete User
router.delete("/users/:id", isAdmin, deleteUserController);

// Get all users (for filter dropdown)
router.get("/filter-users", isAdmin, getAllUsers);

// Get filtered attendance data
router.get("/filter-attendance", isAdmin, getFilteredAttendance);

// Export attendance data (PDF/CSV)
router.get("/attendance/export", isAdmin, exportAttendanceReport);

export default router;