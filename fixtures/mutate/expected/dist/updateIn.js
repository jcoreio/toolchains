"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _iterall = require("iterall");

function _updateIn(obj, path) {
  var notSetValue = arguments.length === 4 ? arguments[2] : undefined;
  var updater = arguments.length === 4 ? arguments[3] : arguments[2];
  var iterator = (0, _iterall.getIterator)(path);
  var iteratorNormalCompletion = false;

  function helper(obj, isSet) {
    var _iterator$next = iterator.next(),
        _key = _iterator$next.value,
        done = _iterator$next.done;

    iteratorNormalCompletion = done;

    if (done) {
      return updater(isSet ? obj : notSetValue);
    }

    var key = _key;

    if (!(obj instanceof Object)) {
      throw new Error('the given path does not exist in the object');
    }

    var oldValue = obj[key];
    var newValue = helper(oldValue, key in obj);
    if (newValue === oldValue) return obj;

    if (Array.isArray(obj)) {
      return [].concat((0, _toConsumableArray2["default"])(obj.slice(0, key)), [newValue], (0, _toConsumableArray2["default"])(obj.slice(key + 1)));
    }

    return (0, _objectSpread3["default"])((0, _objectSpread3["default"])({}, obj), {}, (0, _defineProperty2["default"])({}, key, newValue));
  }

  try {
    return helper(obj, true);
  } finally {
    if (!iteratorNormalCompletion && typeof iterator["return"] === 'function') iterator["return"]();
  }
}

var updateIn = _updateIn;
var _default = updateIn;
exports["default"] = _default;
module.exports = exports.default;