"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = writableLogFunction;
var _util = _interopRequireDefault(require("util"));
function writableLogFunction(writable) {
  return (format, ...args) => {
    writable.write(_util.default.format(format, ...args) + '\n');
  };
}
module.exports = exports.default;
//# sourceMappingURL=writableLogFunction.js.map