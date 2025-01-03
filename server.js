import mongoose from "mongoose";
import app from "./app.js";

const db = process.env.CONNECTION_STRING;
const port = process.env.PORT || 8000;

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

mongoose
  .connect(db)
  .then(() => console.log("Connected Successfully!"))
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server is started on port: ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
