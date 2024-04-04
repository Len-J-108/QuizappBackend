import express from "express";
import dotenv from "dotenv";
dotenv.config();
import "./utils/mongodb.js";
import cors from "cors";

// for socket io
import { createServer } from "http";
import { Server } from "socket.io";

// Routers
import userRouter from "./routers/userRouter.js";
import questRouter from './routers/questRouter.js';
import cookieParser from "cookie-parser";

// Rate Limiter
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT;

const limiter = rateLimit({
  windowMs: 60 * 1000, // one minute
  max: 30,
  message: 'rate limit exceeded',
})

const httpServer = createServer(app);
export const io = new Server(httpServer, { 
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }
 });
// disable express message...
// app.disable('x-powered-by');

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
      origin: 'http://localhost:5173', // 5173 is where we have set our frontend to run
      credentials: true,
  })
);
app.use(limiter);

// socket event on connection
io.on("connection", (socket) => {
  // console.log('socketIO connection made');
    // const token = req.cookies.jwt;
})

// Attach Socket.IO to the server to use it anywhere
app.set('socketio', io);

// Routes
app.use("/users", userRouter);
app.use("/questions", questRouter);

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port:${PORT}`);
});

