const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

exports.initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  // সকেটে ঢোকার আগে টোকেন যাচাই
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Login required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { _id, role, email } = socket.user;
    socket.join(`user:${_id}`);
    if (role === "admin") socket.join("admins");
    console.log(`Socket connected: ${email} (${role})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${email}`);
    });
  });

  return io;
};

exports.notifyAdmins = (event, payload) => {
  if (io) io.to("admins").emit(event, payload);
};

exports.notifyUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};