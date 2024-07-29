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

      socket.on("sendMessage", async (message) => {
        try {
          if (message.user.id) {
            const messageExists = await strapi.db
              .query("api::message.message")
              .findOne({
                where: { users_permissions_user: parseInt(message.user.id) },
              });

            if (!messageExists) {
              await strapi.db.query("api::message.message").create({
                data: {
                  messages: [message.message],
                  users_permissions_user: parseInt(message.user.id),
                  publishedAt: new Date(),  
                },
              });
              io.emit("receiveMessage", [message.message]);
              console.log("Message saved to database");
              return;
            } else {
              await strapi.db.query("api::message.message").update({
                where: { users_permissions_user: parseInt(message.user.id) },
                data: {
                  messages: [...messageExists.messages, message.message],
                  publishedAt: new Date(),  
                },
              });
              console.log("Message saved to database");
              io.emit("receiveMessage", [
                ...messageExists.messages,
                message.message,
              ]);
              return;
            }
          }
        } catch (error) {
          console.error("Error saving message to database", error);
        }
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
