"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = makeError;

var _createForOfIteratorHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/createForOfIteratorHelper"));

var _makeTypeError = _interopRequireDefault(require("./errorReporting/makeTypeError.js"));

var _Validation = _interopRequireDefault(require("./Validation.js"));

function makeError(expected, input) {
  var validation = new _Validation["default"](input);

  var _iterator = (0, _createForOfIteratorHelper2["default"])(expected.errors(validation, [], input)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var error = _step.value;
      validation.errors.push(error);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return (0, _makeTypeError["default"])(validation);
}

module.exports = exports.default;