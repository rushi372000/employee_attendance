import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded => ", decoded);

    // Get user from token
    req.user = await User.findById(decoded._id).select("-password");
    // console.log("req.user => ", req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const isAdmin = (req, res, next) => {
  // console.log("req.user => ", req.user);
  if (req.user && req.user.role === "admin") {
    next();
    // console.log("req.user => ", req.user);
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

export { protect, isAdmin };
