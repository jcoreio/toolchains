"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = writableLogFunction;
var _util = _interopRequireDefault(require("util"));
function writableLogFunction(writable) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (format) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    writable.write(_util["default"].format.apply(_util["default"], [format].concat(args)) + '\n');
  };
}
module.exports = exports.default;
//# sourceMappingURL=writableLogFunction.js.map