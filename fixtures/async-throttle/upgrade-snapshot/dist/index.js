"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.CanceledError = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var CanceledError = /*#__PURE__*/function (_Error) {
  (0, _inherits2["default"])(CanceledError, _Error);
  var _super = _createSuper(CanceledError);
  function CanceledError() {
    var _this;
    (0, _classCallCheck2["default"])(this, CanceledError);
    _this = _super.call(this, 'throttled invocation was canceled');
    _this.name = 'CanceledError';
    return _this;
  }
  return (0, _createClass2["default"])(CanceledError);
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));
exports.CanceledError = CanceledError;
var Delay = /*#__PURE__*/function () {
  function Delay(lastInvocationDone, wait) {
    var _this2 = this;
    (0, _classCallCheck2["default"])(this, Delay);
    (0, _defineProperty2["default"])(this, "canceled", false);
    var delay = new Promise(function (resolve) {
      _this2.timeout = setTimeout(resolve, wait);
      _this2.resolve = resolve;
    });
    this.ready = lastInvocationDone.then(function () {
      return delay;
    }, function () {
      return delay;
    }).then(function () {
      _this2.ready = null;
    });
  }
  (0, _createClass2["default"])(Delay, [{
    key: "flush",
    value: function flush() {
      clearTimeout(this.timeout);
      this.resolve();
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.canceled = true;
      clearTimeout(this.timeout);
      this.resolve();
    }
  }, {
    key: "then",
    value: function then(handler) {
      var _this3 = this;
      return (this.ready || Promise.resolve()).then(function () {
        if (_this3.canceled) throw new CanceledError();
        return handler();
      });
    }
  }]);
  return Delay;
}();
function throttle(fn, _wait) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    /* :: ...null */
  };
  var wait = _wait != null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0;
  var getNextArgs = options.getNextArgs || function (prev, next) {
    return next;
  };
  var nextArgs;
  var lastInvocationDone = null;
  var delay = null;
  var nextInvocation = null;
  function invoke() {
    var args = nextArgs;
    // istanbul ignore next
    if (!args) {
      return Promise.reject(new Error('unexpected error: nextArgs is null'));
    }
    nextInvocation = null;
    nextArgs = null;
    var result = Promise.resolve(fn.apply(void 0, (0, _toConsumableArray2["default"])(args)));
    lastInvocationDone = result["catch"](function () {}).then(function () {
      lastInvocationDone = null;
    });
    delay = new Delay(lastInvocationDone, wait);
    return result;
  }
  function setNextArgs(args) {
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args;
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null');
  }
  function doInvoke() {
    return nextInvocation = (delay || Promise.resolve()).then(invoke);
  }
  function wrapper() {
    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      setNextArgs(args);
    } catch (error) {
      return Promise.reject(error);
    }
    return nextInvocation || doInvoke();
  }

  /**
   * Calls the throttled function soon, but doesn't return a promise, catches
   * any CanceledError, and doesn't create any new promises if a call is already
   * pending.
   *
   * The throttled function should handle all errors internally,
   * e.g.:
   *
   * asyncThrottle(async () => {
   *   try {
   *     await foo()
   *   } catch (err) {
   *     // handle error
   *   }
   * })
   *
   * If the throttled function throws an error or returns a promise that is
   * eventually rejected, the runtime's unhandled promise rejection handler will
   * be called, which may crash the process, route the rejection to a handler
   * that has been previously registered, or ignore the rejection, depending
   * on the runtime and your code.
   */
  wrapper.invokeIgnoreResult = function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    setNextArgs(args);
    if (!nextInvocation) {
      doInvoke()["catch"](function (err) {
        if (!(err instanceof CanceledError)) {
          // trigger the unhandled promise rejection handler
          throw err;
        }
      });
    }
  };
  wrapper.cancel = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var _delay, _delay$cancel;
    var prevLastInvocationDone;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            prevLastInvocationDone = lastInvocationDone;
            (_delay = delay) === null || _delay === void 0 ? void 0 : (_delay$cancel = _delay.cancel) === null || _delay$cancel === void 0 ? void 0 : _delay$cancel.call(_delay);
            nextInvocation = null;
            nextArgs = null;
            lastInvocationDone = null;
            delay = null;
            _context.next = 8;
            return prevLastInvocationDone;
          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  wrapper.flush = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var _delay2, _delay2$flush;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            (_delay2 = delay) === null || _delay2 === void 0 ? void 0 : (_delay2$flush = _delay2.flush) === null || _delay2$flush === void 0 ? void 0 : _delay2$flush.call(_delay2);
            _context2.next = 3;
            return lastInvocationDone;
          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return wrapper;
}
var defaultExport = Object.assign(throttle, {
  CanceledError: CanceledError
});
var _default = defaultExport;
exports["default"] = _default;
//# sourceMappingURL=index.js.map