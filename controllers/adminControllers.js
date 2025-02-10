import moment from "moment";
import Attendance from "../models/attendanceModel.js";
import User from "../models/userModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { parseAsync } from "json2csv";

//Admin Controllers--------------------------------------------
const getAllEmployeeAttendanceController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const attendance = await Attendance.find(query)
      .populate("user", "name email")
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch attendance", error: error.message });
  }
};

const updateAttendanceController = async (req, res) => {
  try {
    const { checkIn, checkOut, status } = req.body;
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance)
      return res.status(404).json({ message: "Attendance record not found" });

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) {
      attendance.checkOut = new Date(checkOut);
      let totalHours = moment(attendance.checkOut).diff(
        moment(attendance.checkIn),
        "hours",
        true
      );
      attendance.totalHours = totalHours.toFixed(2);
      // console.log("attendance.totalHours => ", attendance.totalHours);
    }
    if (status) attendance.status = status;

    await attendance.save();
    res.json({ message: "Attendance updated successfully", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update attendance", error: error.message });
  }
};

const deleteAttendanceController = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete attendance", error: error.message });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUserController = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email department role");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const getFilteredAttendance = async (req, res) => {
  try {
    const { startDate, endDate, department, employeeName } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      // console.log("query.date => ", query.date);
    }
    if (department) {
      const usersInDept = await User.find({ department }, "_id");
      query.user = { $in: usersInDept.map((u) => u._id) };
    }

    if (employeeName) {
      const employee = await User.findOne(
        { name: new RegExp(employeeName, "i") },
        "_id"
      );
      if (employee) {
        query.user = employee._id;
      } else {
        return res.status(404).json({ message: "Employee not found" });
      }
    }

    const attendanceRecords = await Attendance.find(query).populate(
      "user",
      "name email department"
    );
    // console.log("attendanceRecords => ", attendanceRecords);
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching attendance records", error });
  }
};

const exportAttendanceReport = async (req, res) => {
  try {
    const { format } = req.query;
    const attendanceRecords = await Attendance.find().populate(
      "user",
      "name email department"
    );

    if (format === "pdf") {
      const doc = new PDFDocument();
      const filePath = `attendance_report.pdf`;

      doc.pipe(fs.createWriteStream(filePath));
      doc.fontSize(16).text("Attendance Report", { align: "center" });

      attendanceRecords.forEach((record, index) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${record.user.name} | ${
              record.date.toISOString().split("T")[0]
            } | Check-in: ${
              record.checkIn
                ? record.checkIn.toISOString().split("T")[1]
                : "N/A"
            } | Check-out: ${
              record.checkOut
                ? record.checkOut.toISOString().split("T")[1]
                : "N/A"
            }`
          );
      });

      doc.end();
      return res.download(filePath);
    }

    if (format === "csv") {
      const csvData = await parseAsync(attendanceRecords, {
        fields: [
          "user.name",
          "date",
          "checkIn",
          "checkOut",
          "totalHours",
          "status",
        ],
      });

      res.header("Content-Type", "text/csv");
      res.attachment("attendance_report.csv");
      return res.send(csvData);
    }
    res.status(400).json({ message: "Invalid format. Choose 'pdf' or 'csv'." });
  } catch (error) {
    // console.log("error => ", error);
    res.status(500).json({ message: "Error exporting report", error });
  }
};

export {
  getAllEmployeeAttendanceController,
  updateAttendanceController,
  deleteAttendanceController,
  getAllUsersController,
  updateUserController,
  deleteUserController,
  getAllUsers,
  getFilteredAttendance,
  exportAttendanceReport,
};
