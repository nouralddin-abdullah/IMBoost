const mongoose = require("mongoose");
const dotenv = require(`dotenv`);
const fs = require("fs");

// Load environment variables from config.env if it exists
const configPath = `${__dirname}/config.env`;
if (fs.existsSync(configPath)) {
  dotenv.config({ path: configPath });
} else {
  // Fallback to default .env file or process environment variables
  dotenv.config();
}

process.env.TZ = "Africa/Cairo";
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...", err);
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require(`./app`);

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log(`DB connected successfully!`))
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`UNHANDLED REJECTION! Shutting down...`);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
