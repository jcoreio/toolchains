/* eslint-disable @typescript-eslint/no-explicit-any */

export const LOG_LEVEL_TRACE = 1;
export const LOG_LEVEL_DEBUG = 2;
export const LOG_LEVEL_INFO = 3;
export const LOG_LEVEL_WARN = 4;
export const LOG_LEVEL_ERROR = 5;
export const LOG_LEVEL_FATAL = 6;
const LOG_LEVEL_MIN = LOG_LEVEL_TRACE;
const LOG_LEVEL_MAX = LOG_LEVEL_FATAL;
const DEFAULT_LOG_LEVEL = LOG_LEVEL_INFO;
const PATH_SEPARATOR = '.';
export const logLevelToName = {
  [LOG_LEVEL_TRACE]: 'TRACE',
  [LOG_LEVEL_DEBUG]: 'DEBUG',
  [LOG_LEVEL_INFO]: 'INFO',
  [LOG_LEVEL_WARN]: 'WARN',
  [LOG_LEVEL_ERROR]: 'ERROR',
  [LOG_LEVEL_FATAL]: 'FATAL'
};
function assertValidLogLevel(level) {
  switch (level) {
    case LOG_LEVEL_TRACE:
    case LOG_LEVEL_DEBUG:
    case LOG_LEVEL_INFO:
    case LOG_LEVEL_WARN:
    case LOG_LEVEL_ERROR:
    case LOG_LEVEL_FATAL:
      return;
    default:
      throw new Error(`invalid log level: ${level}`);
  }
}
let configuredLogLevels = {};
const envLogLevels = {};
const logLevelAtPath = path => configuredLogLevels[path] || envLogLevels[path];
const envVar = varName => typeof process !== 'undefined' && process.env // eslint-disable-line @typescript-eslint/no-unnecessary-condition
? process.env[varName] // eslint-disable-line @typescript-eslint/no-unnecessary-condition
: undefined; // eslint-disable-line no-undef

let calcedEnvLogLevels = false;
function calcEnvLogLevels() {
  if (calcedEnvLogLevels) return;
  // walk log levels from least to most verbose, so that the most verbose setting wins if
  // the user sets DEBUG=foo and TRACE=foo, foo will be set to TRACE
  for (let logLevel = LOG_LEVEL_MAX; logLevel >= LOG_LEVEL_MIN; --logLevel) {
    const envForLevel = envVar(logLevelToName[logLevel]);
    if (envForLevel && typeof envForLevel === 'string') {
      const targetsForLevel = envForLevel.split(',').filter(Boolean);
      targetsForLevel.forEach(target => {
        envLogLevels[target] = logLevel;
      });
    }
  }
  calcedEnvLogLevels = true;
}
let logLevelsCache = {};
export function resetLogLevels() {
  logLevelsCache = {};
  configuredLogLevels = {};
}
export function setLogLevel(path, level) {
  assertValidLogLevel(level);
  if (level !== configuredLogLevels[path]) {
    configuredLogLevels[path] = level;
    // Bust the cache
    logLevelsCache = {};
  }
}
function calcLogLevel(path) {
  calcEnvLogLevels();
  const levelAtExactPath = logLevelAtPath(path);
  if (levelAtExactPath != null) return levelAtExactPath;
  const exactPathSplit = path.split(PATH_SEPARATOR);
  for (let compareLen = exactPathSplit.length - 1; compareLen >= 0; --compareLen) {
    const subPath = exactPathSplit.slice(0, compareLen).join(PATH_SEPARATOR);
    const levelAtSubPath = logLevelAtPath(subPath);
    if (levelAtSubPath != null) return levelAtSubPath;
  }
  return DEFAULT_LOG_LEVEL;
}
function logLevel(path) {
  let levelForPath = logLevelsCache[path];
  if (levelForPath == null) {
    logLevelsCache[path] = levelForPath = calcLogLevel(path);
  }
  return levelForPath;
}
const hasDate = !envVar('LOG_NO_DATE');
export const defaultLogFunctionProvider = level => level >= LOG_LEVEL_ERROR ? console.error : console.log; // eslint-disable-line no-console

let _logFunctionProvider = defaultLogFunctionProvider;

/**
 * Simple hook to override the logging function. For example, to always log to console.error,
 * call setLogFunctionProvider(() => console.error)
 * @param provider function that returns the log function based on the message's log level
 */
export function setLogFunctionProvider(provider) {
  _logFunctionProvider = provider;
}
function formatDate(d) {
  function part(n, width = 2) {
    return String(n).padStart(width, '0');
  }
  return `${part(d.getFullYear(), 4)}-${part(d.getMonth() + 1)}-${part(d.getDate())} ${part(d.getHours())}:${part(d.getMinutes())}:${part(d.getSeconds())}`;
}
function defaultLogFormat(loggerPath, level) {
  const date = hasDate ? formatDate(new Date()) + ' ' : '';
  return `[${date}${loggerPath}] ${logLevelToName[level]}`;
}
export function createDefaultLogProvider(logFunc) {
  return (loggerPath, level, ...args) => {
    logFunc(defaultLogFormat(loggerPath, level), ...args);
  };
}
export const defaultLogProvider = (loggerPath, level, ...args) => {
  const logFunc = _logFunctionProvider(level);
  logFunc(defaultLogFormat(loggerPath, level), ...args);
};
let _logProvider = defaultLogProvider;

/**
 * Hook to provide a complete replacement for the log provider.
 * @param provider
 */
export function setLogProvider(provider) {
  _logProvider = provider;
}
const loggersByPath = {};
class LoggerImpl {
  loggerPath;
  _logProviders;
  constructor({
    loggerPath,
    logProviders
  }) {
    this.loggerPath = loggerPath;
    this._logProviders = logProviders;
  }
  logAtLevel = (level, ...args) => {
    if (level >= logLevel(this.loggerPath)) {
      let argsToLogger = args;
      if (args.length === 1 && typeof args[0] === 'function') {
        // A single function was passed. Execute that function and log the result.
        // This allows debug text to only be calculated when the relevant debug level is
        // enabled, e.g. log.trace(() => JSON.stringify(data))
        const resolvedArgs = args[0]();
        argsToLogger = Array.isArray(resolvedArgs) ? resolvedArgs : [resolvedArgs];
      }
      for (const provider of this._logProviders || [_logProvider]) {
        provider(this.loggerPath, level, ...argsToLogger);
      }
    }
  };
  levelEnabled = level => {
    return level >= logLevel(this.loggerPath);
  };
  inputLogProvider = (loggerPath, level, ...args) => {
    this.logAtLevel(level, ...args);
  };
  trace = (...args) => {
    this.logAtLevel(LOG_LEVEL_TRACE, ...args);
  };
  debug = (...args) => {
    this.logAtLevel(LOG_LEVEL_DEBUG, ...args);
  };
  info = (...args) => {
    this.logAtLevel(LOG_LEVEL_INFO, ...args);
  };
  warn = (...args) => {
    this.logAtLevel(LOG_LEVEL_WARN, ...args);
  };
  error = (...args) => {
    this.logAtLevel(LOG_LEVEL_ERROR, ...args);
  };
  fatal = (...args) => {
    this.logAtLevel(LOG_LEVEL_FATAL, ...args);
  };
}
export function createLogger(options) {
  return new LoggerImpl(options);
}
export function logger(loggerPath = '') {
  let logger = loggersByPath[loggerPath];
  if (!logger) logger = loggersByPath[loggerPath] = createLogger({
    loggerPath
  });
  return logger;
}
export default logger;
//# sourceMappingURL=index.mjs.map