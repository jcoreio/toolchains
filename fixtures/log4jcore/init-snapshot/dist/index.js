"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LOG_LEVEL_WARN = exports.LOG_LEVEL_TRACE = exports.LOG_LEVEL_INFO = exports.LOG_LEVEL_FATAL = exports.LOG_LEVEL_ERROR = exports.LOG_LEVEL_DEBUG = void 0;
exports.createDefaultLogProvider = createDefaultLogProvider;
exports.createLogger = createLogger;
exports.logLevelToName = exports.defaultLogProvider = exports.defaultLogFunctionProvider = exports["default"] = void 0;
exports.logger = logger;
exports.resetLogLevels = resetLogLevels;
exports.setLogFunctionProvider = setLogFunctionProvider;
exports.setLogLevel = setLogLevel;
exports.setLogProvider = setLogProvider;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logLevelToName;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/* eslint-disable @typescript-eslint/no-explicit-any */
var LOG_LEVEL_TRACE = 1;
exports.LOG_LEVEL_TRACE = LOG_LEVEL_TRACE;
var LOG_LEVEL_DEBUG = 2;
exports.LOG_LEVEL_DEBUG = LOG_LEVEL_DEBUG;
var LOG_LEVEL_INFO = 3;
exports.LOG_LEVEL_INFO = LOG_LEVEL_INFO;
var LOG_LEVEL_WARN = 4;
exports.LOG_LEVEL_WARN = LOG_LEVEL_WARN;
var LOG_LEVEL_ERROR = 5;
exports.LOG_LEVEL_ERROR = LOG_LEVEL_ERROR;
var LOG_LEVEL_FATAL = 6;
exports.LOG_LEVEL_FATAL = LOG_LEVEL_FATAL;
var LOG_LEVEL_MIN = LOG_LEVEL_TRACE;
var LOG_LEVEL_MAX = LOG_LEVEL_FATAL;
var DEFAULT_LOG_LEVEL = LOG_LEVEL_INFO;
var PATH_SEPARATOR = '.';
var logLevelToName = (_logLevelToName = {}, (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_TRACE, 'TRACE'), (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_DEBUG, 'DEBUG'), (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_INFO, 'INFO'), (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_WARN, 'WARN'), (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_ERROR, 'ERROR'), (0, _defineProperty2["default"])(_logLevelToName, LOG_LEVEL_FATAL, 'FATAL'), _logLevelToName);
exports.logLevelToName = logLevelToName;

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
      throw new Error("invalid log level: ".concat(level));
  }
}

var configuredLogLevels = {};
var envLogLevels = {};

var logLevelAtPath = function logLevelAtPath(path) {
  return configuredLogLevels[path] || envLogLevels[path];
};

var envVar = function envVar(varName) {
  return typeof process !== 'undefined' && process.env ? process.env[varName] : undefined;
}; // eslint-disable-line no-undef


var calcedEnvLogLevels = false;

function calcEnvLogLevels() {
  if (calcedEnvLogLevels) return; // walk log levels from least to most verbose, so that the most verbose setting wins if
  // the user sets DEBUG=foo and TRACE=foo, foo will be set to TRACE

  var _loop = function _loop(_logLevel) {
    var envForLevel = envVar(logLevelToName[_logLevel]);

    if (envForLevel && typeof envForLevel === 'string') {
      var targetsForLevel = envForLevel.split(',').filter(Boolean);
      targetsForLevel.forEach(function (target) {
        envLogLevels[target] = _logLevel;
      });
    }
  };

  for (var _logLevel = LOG_LEVEL_MAX; _logLevel >= LOG_LEVEL_MIN; --_logLevel) {
    _loop(_logLevel);
  }

  calcedEnvLogLevels = true;
}

var logLevelsCache = {};

function resetLogLevels() {
  logLevelsCache = {};

  for (var _path in configuredLogLevels) {
    delete configuredLogLevels[_path];
  }
}

function setLogLevel(path, level) {
  assertValidLogLevel(level);

  if (level !== configuredLogLevels[path]) {
    configuredLogLevels[path] = level; // Bust the cache

    logLevelsCache = {};
  }
}

function calcLogLevel(path) {
  calcEnvLogLevels();
  var levelAtExactPath = logLevelAtPath(path);
  if (levelAtExactPath != null) return levelAtExactPath;
  var exactPathSplit = path.split(PATH_SEPARATOR);

  for (var compareLen = exactPathSplit.length - 1; compareLen >= 0; --compareLen) {
    var subPath = exactPathSplit.slice(0, compareLen).join(PATH_SEPARATOR);
    var levelAtSubPath = logLevelAtPath(subPath);
    if (levelAtSubPath != null) return levelAtSubPath;
  }

  return DEFAULT_LOG_LEVEL;
}

function logLevel(path) {
  var levelForPath = logLevelsCache[path];

  if (levelForPath == null) {
    logLevelsCache[path] = levelForPath = calcLogLevel(path);
  }

  return levelForPath;
}

var hasDate = !envVar('LOG_NO_DATE');

var defaultLogFunctionProvider = function defaultLogFunctionProvider(level) {
  return level >= LOG_LEVEL_ERROR ? console.error : console.log;
}; // eslint-disable-line no-console


exports.defaultLogFunctionProvider = defaultLogFunctionProvider;
var _logFunctionProvider = defaultLogFunctionProvider;
/**
 * Simple hook to override the logging function. For example, to always log to console.error,
 * call setLogFunctionProvider(() => console.error)
 * @param provider function that returns the log function based on the message's log level
 */

function setLogFunctionProvider(provider) {
  _logFunctionProvider = provider;
}

function formatDate(d) {
  function part(n) {
    var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    return String(n).padStart(width, '0');
  }

  return "".concat(part(d.getFullYear(), 4), "-").concat(part(d.getMonth() + 1), "-").concat(part(d.getDate()), " ").concat(part(d.getHours()), ":").concat(part(d.getMinutes()), ":").concat(part(d.getSeconds()));
}

function defaultLogFormat(loggerPath, level) {
  var date = hasDate ? formatDate(new Date()) + ' ' : '';
  return "[".concat(date).concat(loggerPath, "] ").concat(logLevelToName[level]);
}

function createDefaultLogProvider(logFunc) {
  return function (loggerPath, level) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    logFunc.apply(void 0, [defaultLogFormat(loggerPath, level)].concat(args));
  };
}

var defaultLogProvider = function defaultLogProvider(loggerPath, level) {
  var logFunc = _logFunctionProvider(level);

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  logFunc.apply(void 0, [defaultLogFormat(loggerPath, level)].concat(args));
};

exports.defaultLogProvider = defaultLogProvider;
var _logProvider = defaultLogProvider;
/**
 * Hook to provide a complete replacement for the log provider.
 * @param provider
 */

function setLogProvider(provider) {
  _logProvider = provider;
}

var loggersByPath = {};
var LoggerImpl = /*#__PURE__*/(0, _createClass2["default"])(function LoggerImpl(_ref) {
  var _this = this;

  var loggerPath = _ref.loggerPath,
      logProviders = _ref.logProviders;
  (0, _classCallCheck2["default"])(this, LoggerImpl);
  (0, _defineProperty2["default"])(this, "loggerPath", void 0);
  (0, _defineProperty2["default"])(this, "_logProviders", void 0);
  (0, _defineProperty2["default"])(this, "logAtLevel", function (level) {
    if (level >= logLevel(_this.loggerPath)) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var argsToLogger = args;

      if (args.length === 1 && typeof args[0] === 'function') {
        // A single function was passed. Execute that function and log the result.
        // This allows debug text to only be calculated when the relevant debug level is
        // enabled, e.g. log.trace(() => JSON.stringify(data))
        var resolvedArgs = args[0]();
        argsToLogger = Array.isArray(resolvedArgs) ? resolvedArgs : [resolvedArgs];
      }

      var _iterator = _createForOfIteratorHelper(_this._logProviders || [_logProvider]),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var provider = _step.value;
          provider.apply(void 0, [_this.loggerPath, level].concat((0, _toConsumableArray2["default"])(argsToLogger)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  });
  (0, _defineProperty2["default"])(this, "levelEnabled", function (level) {
    return level >= logLevel(_this.loggerPath);
  });
  (0, _defineProperty2["default"])(this, "inputLogProvider", function (loggerPath, level) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
      args[_key4 - 2] = arguments[_key4];
    }

    _this.logAtLevel.apply(_this, [level].concat(args));
  });
  (0, _defineProperty2["default"])(this, "trace", function () {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_TRACE].concat(args));
  });
  (0, _defineProperty2["default"])(this, "debug", function () {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_DEBUG].concat(args));
  });
  (0, _defineProperty2["default"])(this, "info", function () {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_INFO].concat(args));
  });
  (0, _defineProperty2["default"])(this, "warn", function () {
    for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_WARN].concat(args));
  });
  (0, _defineProperty2["default"])(this, "error", function () {
    for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_ERROR].concat(args));
  });
  (0, _defineProperty2["default"])(this, "fatal", function () {
    for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      args[_key10] = arguments[_key10];
    }

    _this.logAtLevel.apply(_this, [LOG_LEVEL_FATAL].concat(args));
  });
  this.loggerPath = loggerPath;
  this._logProviders = logProviders;
});

function createLogger(options) {
  return new LoggerImpl(options);
}

function logger() {
  var loggerPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var logger = loggersByPath[loggerPath];
  if (!logger) logger = loggersByPath[loggerPath] = createLogger({
    loggerPath: loggerPath
  });
  return logger;
}

var _default = logger;
exports["default"] = _default;