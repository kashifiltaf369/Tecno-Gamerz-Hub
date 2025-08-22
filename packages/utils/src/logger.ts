import pino from 'pino';
import pinoHttp from 'pino-http';
import { nanoid } from 'nanoid';
import { NODE_ENV, IS_PRODUCTION } from './constants';

// Logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug'),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
    ],
    censor: '[REDACTED]',
  },
};

// Add pretty printing for development
if (!IS_PRODUCTION) {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  };
}

// Create base logger
export const logger = pino(loggerConfig);

// HTTP logger middleware
export const httpLogger = pinoHttp({
  logger,
  genReqId: () => nanoid(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  customReceivedMessage: (req) => {
    return `${req.method} ${req.url}`;
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader('content-type'),
        'content-length': res.getHeader('content-length'),
        'cache-control': res.getHeader('cache-control'),
      },
    }),
    err: pino.stdSerializers.err,
  },
});

// Utility functions for structured logging
export const createLogger = (context: string) => {
  return logger.child({ context });
};

export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.child({ 
    requestId, 
    userId,
    context: 'request',
  });
};

// Performance logging helper
export const logPerformance = (
  logger: pino.Logger,
  operation: string,
  startTime: number,
  metadata?: Record<string, unknown>
) => {
  const duration = Date.now() - startTime;
  logger.info({
    operation,
    duration,
    ...metadata,
  }, `Operation '${operation}' completed in ${duration}ms`);
};

// Error logging helper
export const logError = (
  logger: pino.Logger,
  error: Error,
  context?: string,
  metadata?: Record<string, unknown>
) => {
  logger.error({
    err: error,
    context,
    ...metadata,
  }, error.message);
};

// Audit logging helper
export const logAudit = (
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) => {
  logger.info({
    type: 'audit',
    userId,
    action,
    resource,
    resourceId,
    ipAddress,
    userAgent,
    ...metadata,
  }, `Audit: ${action} on ${resource}${resourceId ? ` (${resourceId})` : ''}`);
};

// Security logging helper
export const logSecurity = (
  event: 'auth_success' | 'auth_failure' | 'permission_denied' | 'suspicious_activity',
  details: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }
) => {
  logger.warn({
    type: 'security',
    event,
    ...details,
  }, `Security event: ${event}`);
};