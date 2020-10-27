import _createForOfIteratorHelper from "@babel/runtime/helpers/createForOfIteratorHelper";
import makeTypeError from "./errorReporting/makeTypeError.mjs";
import Validation from "./Validation.mjs";
export default function makeError(expected, input) {
  var validation = new Validation(input);

  var _iterator = _createForOfIteratorHelper(expected.errors(validation, [], input)),
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

  return makeTypeError(validation);
}