const socketIo = require("socket.io");

module.exports = (server) => {
  const options = {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  };

  const io = socketIo(server, options);

  io.on("connection", (socket) => {
    const secret = process.env.SOCKET_SECRET;

    socket.on("setup", (userId) => {
      socket.join(userId + secret);
    });

    socket.on("send notification", (userIds = [], roomId) => {
      userIds.forEach((userId) => {
        socket.broadcast
          .to(userId + secret)
          .emit("notification received", roomId);
      });
    });
  });
};
