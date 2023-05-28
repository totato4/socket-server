const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const route = require("./route");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");
app.use(cors({ origin: "*" }));
app.use(route);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);
    const { user, isExist } = addUser({ name, room });
    console.log(`isExist`, isExist);
    const userMessage = isExist
      ? `${user.name}, here you go again`
      : `${name} jas joined.`;

    socket.emit("message", {
      data: { user: { name: "Admin" }, message: `Hello ${name}` },
    });
    socket.broadcast.to(room).emit("message", {
      data: { user: { name: "Admin" }, message: userMessage },
    });
    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });

    socket.on("sendMessage", ({ message, params }) => {
      const user = findUser(params);

      if (user) {
        io.to(user.room).emit("message", { data: { user, message } });
      }
    });
    socket.on("leftRoom", ({ params }) => {
      const user = removeUser(params);

      if (user) {
        const { room, name } = user;
        io.to(room).emit("message", {
          data: { user: { name: "Admin" }, message: `${name} has left` },
        });
        io.to(room).emit("room", {
          data: { users: getRoomUsers(room) },
        });
      }
    });
  });
  io.on("disconnect", () => {
    console.log("Disconnect");
  });
});

server.listen(5500, () => {
  console.log("Server is running");
});

// import express from "express";
// import * as http from "http"; //ES 6
// import { Server } from "http";
// import cors from "cors";
// import router from "./router.js";

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(router);
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("join", ({ name, room }) => {
//     socket.join(room);
//     socket.emit("message", {
//       data: { user: { name: "Admin" }, message: `Hello ${name}` },
//     });
//   });
//   io.on("disconnect", () => {
//     console.log("Disconnect");
//   });
// });

// server.listen(5500, () => {
//   console.log("Server is running");
// });
