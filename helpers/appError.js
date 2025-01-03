export function appError(errorMessage, errorStatusCode, err) {
  const error = new Error(errorMessage);
  error.status = false;
  error.statusCode = errorStatusCode;
  error.isOperational = true;
  error.completeError = err;
  return error;
}
