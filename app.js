import dotenv from "dotenv";
import express from "express";
import { appError } from "./helpers/appError.js";
import { globalErrorHandler } from "./helpers/globalErrorHandler.js";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRouter from "./routes/productRouter.js";
import bidRouter from "./routes/bidRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
const app = express();

dotenv.config({ path: "./.env" });

//Body parser middleware reading data from req.body
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    // origin: ["http://localhost:3000", "https://arbaz-smp-frontend.vercel.app"],
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    credentials: true,
  })
);

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/bid", bidRouter);
app.use("/api/notification", notificationRouter);

app.all("*", (req, res, next) => {
  next(
    appError(
      `Requested url:${req.originalUrl} was not found on this server!`,
      404
    )
  );
});

//Global error handling middleware
app.use(globalErrorHandler);

export default app;
