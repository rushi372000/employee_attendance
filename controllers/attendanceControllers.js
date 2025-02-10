import moment from "moment";
import Attendance from "../models/attendanceModel.js";
import User from "../models/userModel.js";

const checkInController = async (req, res) => {
  try {
    const { user } = req;
    // console.log("user => ", req);
    const today = moment().startOf("day");

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: today.toDate(), $lt: moment(today).add(1, "day").toDate() },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // Create or update attendance
    const attendance =
      existingAttendance ||
      new Attendance({
        user: user._id,
        date: new Date(),
      });

    attendance.checkIn = new Date();
    attendance.status = moment().hour() > 9 ? "late" : "present";

    await attendance.save();

    res.json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Check-in failed", error: error.message });
  }
};

const checkOutController = async (req, res) => {
  try {
    // console.log("req => ", req);
    const { user } = req;
    const today = moment().startOf("day");

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: today.toDate(), $lt: moment(today).add(1, "day").toDate() },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "No check-in record found" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    // Calculate total hours
    const checkOutTime = new Date();
    const totalHours = moment(checkOutTime).diff(
      moment(attendance.checkIn),
      "hours",
      true
    );

    attendance.checkOut = checkOutTime;
    attendance.totalHours = Number(totalHours.toFixed(2));
    attendance.status = "present";

    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Check-out failed", error: error.message });
  }
};

const getEmployeeAttendanceController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      user: req.user._id,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 }).lean();

    res.json(attendance);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = moment().startOf("day").toDate();

    // Check if user forgot to check out
    const missedCheckOut = await Attendance.findOne({
      user: userId,
      date: { $gte: today },
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    });

    // Check if user has not checked in today
    const hasCheckedIn = await Attendance.exists({
      user: userId,
      date: { $gte: today },
      checkIn: { $exists: true },
    });

    let notifications = [];

    if (missedCheckOut) {
      notifications.push("You forgot to check out today.");
    }
    if (!hasCheckedIn) {
      notifications.push("You haven't logged your attendance today.");
    }

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

export {
  checkInController,
  checkOutController,
  getEmployeeAttendanceController,
  getNotifications,
};
