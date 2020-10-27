import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _objectSpread from "@babel/runtime/helpers/objectSpread2";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import { getIterator } from "iterall";

function _updateIn(obj, path) {
  var notSetValue = arguments.length === 4 ? arguments[2] : undefined;
  var updater = arguments.length === 4 ? arguments[3] : arguments[2];
  var iterator = getIterator(path);
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
      return [].concat(_toConsumableArray(obj.slice(0, key)), [newValue], _toConsumableArray(obj.slice(key + 1)));
    }

    return _objectSpread(_objectSpread({}, obj), {}, _defineProperty({}, key, newValue));
  }

  try {
    return helper(obj, true);
  } finally {
    if (!iteratorNormalCompletion && typeof iterator["return"] === 'function') iterator["return"]();
  }
}

var updateIn = _updateIn;
export default updateIn;