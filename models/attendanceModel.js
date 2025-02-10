import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "absent",
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
