import _createForOfIteratorHelper from "@babel/runtime/helpers/createForOfIteratorHelper";

/**
 * 
 * @prettier
 */
import * as React from "react";
import { useContext, useEffect, useRef } from "react";
var bpfrpt_proptype_TransitionState = PropTypes.oneOf(["out", "in", "appearing", "entering", "leaving"]);
var BaseTransitionContext = /*#__PURE__*/React.createContext('in');
export function useTransitionContext() {
  return useContext(BaseTransitionContext);
}
var priority = ['out', 'leaving', 'appearing', 'entering'];
export function overallTransitionState(parentState, childState) {
  var _iterator = _createForOfIteratorHelper(priority),
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
  "state": PropTypes.oneOf(["out", "in", "appearing", "entering", "leaving"]).isRequired,
  "children": PropTypes.node.isRequired
};
export function TransitionContext(_ref) {
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

var bpfrpt_proptype_TransitionStateEffect = PropTypes.func;
export function useTransitionStateEffect(effect) {
  var nextState = useTransitionContext();
  var prevStateRef = useRef(null);
  var effectRef = useRef(effect);
  effectRef.current = effect;
  useEffect(function () {
    var prevState = prevStateRef.current;
    var effect = effectRef.current;
    prevStateRef.current = nextState;
    effect(prevState, nextState);
  }, [nextState]);
  useEffect(function () {
    return function () {
      var effect = effectRef.current;
      if (!outish(nextState)) effect(nextState, 'leaving');
    };
  }, []);
}
export function useTransitionStateEffectFilter(filter) {
  return function (effect) {
    return useTransitionStateEffect(function (prevState, nextState) {
      if (filter(prevState, nextState)) effect(prevState, nextState);
    });
  };
}
export var useAppearingEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return outish(prevState || 'out') && nextState === 'appearing';
});
export var useEnteringEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return outish(prevState || 'out') && nextState === 'entering';
});
export var useAppearedEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'appearing' && nextState === 'in';
});
export var useEnteredEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'entering' && nextState === 'in';
});
export var useCameInEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return nextState === 'in';
});
export var useLeavingEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return !outish(prevState || 'out') && nextState === 'leaving';
});
export var useLeftEffect = useTransitionStateEffectFilter(function (prevState, nextState) {
  return prevState === 'leaving' && nextState === 'out';
});
export function useAutofocusRef() {
  var ref = useRef();
  useCameInEffect(function () {
    var el = ref.current;

    if (el) {
      el.focus();
      if (typeof el.select === 'function') el.select();
    }
  });
  return ref;
}
import PropTypes from "prop-types";
export { bpfrpt_proptype_TransitionState };
export { bpfrpt_proptype_Props };
export { bpfrpt_proptype_TransitionStateEffect };