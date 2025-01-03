export function globalErrorHandler(error, req, res, next) {
  if (process.env.NODE_ENV === "development") {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: false,
        message: error.message,
        error: error,
        errorStack: error.stack.split("\n"),
      });
    } else {
      res.status(500).json({
        status: false,
        message: error.message,
        error: error,
        errorStack: error.stack.split("\n").join(" "),
      });
    }
  } else if (process.env.NODE_ENV === "production") {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }
  }
}
