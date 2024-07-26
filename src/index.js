"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    let interval;
    var io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", function (socket) {
      if (interval) clearInterval(interval);
      console.log("User connected");
      io.emit("Connection Establish Succwssfully!!");
      socket.on("message", async (data) => {
        console.log(data);
        io.emit(`message: ${data}`);
      });


      socket.on("disconnect", () => {
        console.log("user disconnected");
        clearInterval(interval);
      });
    });

    //Make the socket global
    strapi.io = io;
  },
};
