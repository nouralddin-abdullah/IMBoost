const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const accountRouter = require("./routes/accountRouter");
const userRouter = require("./routes/userRouter");
const autoLikeRoutes = require('./routes/autoLike.routes');
const autoCommentRoutes = require('./routes/autoComment.routes');
app.enable("trust proxy");

// 2) CORS configuration
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
    credentials: true,
  })
);

// 3) Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 4) Request limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

// app.use("/api", limiter);

// 5) Body parsers
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

// Configure multer for form-data parsing
const upload = multer();
app.use(upload.none()); // For text fields only (no file uploads)

app.use(cookieParser());
// app.use(mongoSanitize()); // Temporarily disabled due to Express 5 compatibility issue
app.use(express.static(path.join(__dirname, "static")));

// 8) Custom headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// 9) Request timestamp
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 10) Test route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "IMVU Booster API is running!",
    timestamp: new Date().toISOString(),
  });
});

// 11) API Routes
app.use("/api/account", accountRouter);
app.use("/api/user", userRouter);
app.use('/api/auto-like', autoLikeRoutes);
app.use('/api/auto-comment', autoCommentRoutes);

// 12) Catch-all route - Express 5 compatible
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler.globalErrorHandle);

module.exports = app;
