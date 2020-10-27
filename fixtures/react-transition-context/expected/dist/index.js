"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTransitionContext = useTransitionContext;
exports.overallTransitionState = overallTransitionState;
exports.TransitionContext = TransitionContext;
exports.useTransitionStateEffect = useTransitionStateEffect;
exports.useTransitionStateEffectFilter = useTransitionStateEffectFilter;
exports.useAutofocusRef = useAutofocusRef;
exports.bpfrpt_proptype_TransitionStateEffect = exports.bpfrpt_proptype_Props = exports.bpfrpt_proptype_TransitionState = exports.useLeftEffect = exports.useLeavingEffect = exports.useCameInEffect = exports.useEnteredEffect = exports.useAppearedEffect = exports.useEnteringEffect = exports.useAppearingEffect = void 0;

var _createForOfIteratorHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/createForOfIteratorHelper"));

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

/**
 * 
 * @prettier
 */
var bpfrpt_proptype_TransitionState = _propTypes["default"].oneOf(["out", "in", "appearing", "entering", "leaving"]);

exports.bpfrpt_proptype_TransitionState = bpfrpt_proptype_TransitionState;
var BaseTransitionContext = /*#__PURE__*/React.createContext('in');

function useTransitionContext() {
  return (0, React.useContext)(BaseTransitionContext);
}

var priority = ['out', 'leaving', 'appearing', 'entering'];

function overallTransitionState(parentState, childState) {
  var _iterator = (0, _createForOfIteratorHelper2["default"])(priority),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var state = _step.value;
      if (parentState === state || childState === state) return state;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return childState;
}

var bpfrpt_proptype_Props = {
  "state": _propTypes["default"].oneOf(["out", "in", "appearing", "entering", "leaving"]).isRequired,
  "children": _propTypes["default"].node.isRequired
};
exports.bpfrpt_proptype_Props = bpfrpt_proptype_Props;

function TransitionContext(_ref) {
  var state = _ref.state,
      children = _ref.children;
  var parentState = useTransitionContext();
  var overallState = overallTransitionState(parentState, state);
  return /*#__PURE__*/React.createElement(BaseTransitionContext.Provider, {
    value: overallState
  }, children);
}

TransitionContext.propTypes = bpfrpt_proptype_Props;

function outish(state) {
  return state === 'out' || state === 'leaving';
}

var bpfrpt_proptype_TransitionStateEffect = _propTypes["default"].func;
exports.bpfrpt_proptype_TransitionStateEffect = bpfrpt_proptype_TransitionStateEffect;

function useTransitionStateEffect(effect) {
  var nextState = useTransitionContext();
  var prevStateRef = (0, React.useRef)(null);
  var effectRef = (0, React.useRef)(effect);
  effectRef.current = effect;
  (0, React.useEffect)(function () {
    var prevState = prevStateRef.current;
    var effect = effectRef.current;
    prevStateRef.current = nextState;
    effect(prevState, nextState);
  }, [nextState]);
  (0, React.useEffect)(function () {
    return function () {
      var effect = effectRef.current;
      if (!outish(nextState)) effect(nextState, 'leaving');
    };
  }, []);
}

function useTransitionStateEffectFilter(filter) {
  return function (effect) {
    return useTransitionStateEffect(function (prevState, nextState) {
      if (filter(prevState, nextState)) effect(prevState, nextState);
    });
  };
}

var useAppearingEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return outish(prevState || 'out') && nextState === 'appearing';
});
exports.useAppearingEffect = useAppearingEffect;
var useEnteringEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return outish(prevState || 'out') && nextState === 'entering';
});
exports.useEnteringEffect = useEnteringEffect;
var useAppearedEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'appearing' && nextState === 'in';
});
exports.useAppearedEffect = useAppearedEffect;
var useEnteredEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'entering' && nextState === 'in';
});
exports.useEnteredEffect = useEnteredEffect;
var useCameInEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return nextState === 'in';
});
exports.useCameInEffect = useCameInEffect;
var useLeavingEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return !outish(prevState || 'out') && nextState === 'leaving';
});
exports.useLeavingEffect = useLeavingEffect;
var useLeftEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'leaving' && nextState === 'out';
});
exports.useLeftEffect = useLeftEffect;

function useAutofocusRef() {
  var ref = (0, React.useRef)();
  useCameInEffect(function () {
    var el = ref.current;

    if (el) {
      el.focus();
      if (typeof el.select === 'function') el.select();
    }
  });
  return ref;
}