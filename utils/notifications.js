import cron from "node-cron";
import moment from "moment";
import Attendance from "../models/attendanceModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js"; // Function to send emails

console.log("Cron Jobs initialized!");
//Check for employees who forgot to check out (Runs every day at 8 PM)
cron.schedule("0 20 * * *", async () => {
  // console.log("Running checkout reminder cron job...");
  try {
    const today = moment().startOf("day").toDate();
    const unattendedEmployees = await Attendance.find({
      date: { $gte: today },
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    }).populate("user", "name email");

    unattendedEmployees.forEach((record) => {
      const message = `Hi ${record.user.name}, you forgot to check out today. Please update your attendance.`;
      sendEmail(record.user.email, "Reminder: Checkout Pending", message);
    });

    // console.log("Notifications sent for missing check-outs.");
  } catch (error) {
    // console.error("Error sending checkout reminders:", error);
  }
});

// Send reminders to employees who haven't checked in (Runs daily at 10 AM)
cron.schedule("0 10 * * *", async () => {
  // console.log("Running check-in reminder cron job...");
  try {
    const today = moment().startOf("day").toDate();
    const allEmployees = await User.find({}, "_id name email");

    const checkedInUsers = await Attendance.find({
      date: { $gte: today },
      checkIn: { $exists: true },
    }).distinct("user");

    const missingCheckIns = allEmployees.filter(
      (emp) => !checkedInUsers.includes(emp._id.toString())
    );

    missingCheckIns.forEach((employee) => {
      const message = `Hi ${employee.name}, please remember to log your attendance today.`;
      sendEmail(employee.email, "Attendance Reminder", message);
    });

    // console.log("Reminders sent to employees who haven't checked in.");
  } catch (error) {
    // console.error("Error sending check-in reminders:", error);
  }
});

export default cron;
