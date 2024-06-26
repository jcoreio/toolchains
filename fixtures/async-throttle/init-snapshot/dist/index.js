"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
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
      return this.ready.then(function () {
        if (_this3.canceled) throw new CanceledError();
        return handler();
      });
    }
  }]);
  return Delay;
}();
function throttle(fn, _wait) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var wait = _wait != null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0;
  var getNextArgs = options.getNextArgs || function (prev, next) {
    return next;
  };
  var nextArgs;
  var lastInvocationDone = Promise.resolve();
  var delay = new Delay(lastInvocationDone, 0);
  var nextInvocation = null;
  function invoke() {
    var args = nextArgs;
    // istanbul ignore next
    if (!args) throw new Error('unexpected error: nextArgs is null');
    nextInvocation = null;
    nextArgs = null;
    var result = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fn.apply(void 0, (0, _toConsumableArray2["default"])(args));
            case 2:
              return _context.abrupt("return", _context.sent);
            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
    lastInvocationDone = result["catch"](function () {});
    delay = new Delay(lastInvocationDone, wait);
    return result;
  }
  function wrapper() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args;
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null');
    if (!nextInvocation) nextInvocation = delay.then(invoke);
    return nextInvocation;
  }
  wrapper.cancel = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var prevLastInvocationDone;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            prevLastInvocationDone = lastInvocationDone;
            delay.cancel();
            nextInvocation = null;
            nextArgs = null;
            lastInvocationDone = Promise.resolve();
            delay = new Delay(lastInvocationDone, 0);
            _context2.next = 8;
            return prevLastInvocationDone;
          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  wrapper.flush = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            delay.flush();
            _context3.next = 3;
            return lastInvocationDone;
          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return wrapper;
}
;
throttle.CanceledError = CanceledError;
var _default = throttle;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map