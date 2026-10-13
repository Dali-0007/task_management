// Errors with a statusCode are safe to show to the client; anything else is
// logged and reported as a generic server error.
function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sendError(res, error, fallbackMessage, logLabel) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(`${logLabel}:`, error.message);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

module.exports = { createHttpError, sendError };
