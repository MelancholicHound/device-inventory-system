class AppError extends Error {
    constructor(message, statusCode, data = null) {
        super(message),
        this.statusCode = statusCode,
        this.data = data
    }
}

const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message: message, 
            data: error.data || null
        }
    });
}

const createErrors = {
    badRequest: (message = 'Bad Request', data = null) => new AppError(message, 400, data),
    unauthorized: (message = 'Unauthorized', data = null) => new AppError(message, 401, data),
    forbidden: (message = 'Forbidden', data = null) => new AppError(message, 403, data),
    notFound: (message = 'Not Found', data = null) => new AppError(message, 404, data),
    methodNotAllowed: (message = 'Method Not Allowed', data = null) => new AppError(message, 405, data),
    conflict: (message = 'Conflict', data = null) => new AppError(message, 409, data),
    unprocessableEntity: (message = 'Unprocessable Entity', data = null) => new AppError(message, 422, data),
    internalServerError: (message = 'Internal Server Error', data = null) => new AppError(message, 500, data),
    notImplemented: (message = 'Not Implemented', data = null) => new AppError(message, 501, data),
    serviceUnavailable: (message = 'Service Unavailable', data = null) => new AppError(message, 503, data),
};

module.exports = { errorHandler, createErrors };