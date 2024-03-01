"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultProps = exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _inlineStylePrefixer = _interopRequireDefault(require("inline-style-prefixer"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; } /* eslint-env browser */

var fillStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};
var baseViewStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
  whiteSpace: 'normal',
  width: '100%'
};
var defaultProps = {
  animateHeight: true,
  transitionDuration: 500,
  transitionTimingFunction: 'ease',
  keepViewsMounted: false,
  prefixer: new _inlineStylePrefixer["default"](),
  style: {},
  viewportStyle: {},
  rtl: false,
  spacing: 1
};
exports.defaultProps = defaultProps;

function applyDefaults(props) {
  var result = _objectSpread({}, props);

  for (var key in defaultProps) {
    if (Object.prototype.hasOwnProperty.call(defaultProps, key) && props[key] == null) {
      result[key] = defaultProps[key];
    }
  }

  return result;
}

var ViewSlider = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(ViewSlider, _React$Component);

  var _super = _createSuper(ViewSlider);

  function ViewSlider() {
    var _this;

    (0, _classCallCheck2["default"])(this, ViewSlider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      height: undefined,
      transitioning: false,
      activeView: _this.props.activeView,
      numViews: _this.props.numViews,
      // this is used to determine the correct transitionState for the previous active view.
      prevActiveView: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "views", []);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "timeouts", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "lastProps", _this.props);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getDefaultedProps", function () {
      if (_this.lastProps !== _this.props || !_this.lastDefaultedProps) {
        _this.lastProps = _this.props;
        _this.lastDefaultedProps = applyDefaults(_this.props);
      }

      return _this.lastDefaultedProps;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "measureHeight", function (node) {
      if (!node) return null;
      return node.clientHeight;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onTransitionEnd", function (event) {
      // ignore transitionend events from deeper components
      if (event && event.target !== _this.viewport) return; // phase 0: unset height and disable transitions

      _this.setState({
        height: undefined,
        numViews: _this.props.numViews,
        prevActiveView: null,
        transitioning: false
      }, function () {
        var onSlideTransitionEnd = _this.props.onSlideTransitionEnd;
        if (onSlideTransitionEnd) onSlideTransitionEnd();
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getTransitionState", function (childIndex) {
      var _this$state = _this.state,
          activeView = _this$state.activeView,
          prevActiveView = _this$state.prevActiveView;
      if (prevActiveView == null) return childIndex === activeView ? 'in' : 'out';
      if (childIndex === activeView) return 'entering';
      if (childIndex === prevActiveView) return 'leaving';
      return 'out';
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "renderView", function (index) {
      var _this$getDefaultedPro = _this.getDefaultedProps(),
          fillParent = _this$getDefaultedPro.fillParent,
          prefixer = _this$getDefaultedPro.prefixer,
          keepViewsMounted = _this$getDefaultedPro.keepViewsMounted,
          spacing = _this$getDefaultedPro.spacing,
          rtl = _this$getDefaultedPro.rtl,
          viewStyle = _this$getDefaultedPro.viewStyle,
          innerViewWrapperStyle = _this$getDefaultedPro.innerViewWrapperStyle;

      var _this$state2 = _this.state,
          activeView = _this$state2.activeView,
          transitioning = _this$state2.transitioning;

      var style = _objectSpread(_objectSpread({}, baseViewStyle), viewStyle);

      if (fillParent) {
        Object.assign(style, fillStyle);
        style.overflow = 'auto';
        if (rtl) style.right = "".concat(index * spacing * 100, "%");else style.left = "".concat(index * spacing * 100, "%");
      } else if (index > 0) {
        if (rtl) style.marginRight = "".concat((spacing - 1) * 100, "%");else style.marginLeft = "".concat((spacing - 1) * 100, "%");
      } // when not transitioning, render empty placeholder divs before the active view to push it into the right
      // horizontal position


      if (!transitioning && activeView !== index && !keepViewsMounted) {
        return /*#__PURE__*/React.createElement("div", {
          key: index,
          style: prefixer.prefix(style)
        });
      }

      return /*#__PURE__*/React.createElement("div", {
        key: index,
        style: prefixer.prefix(style),
        ref: function ref(c) {
          return _this.views[index] = c;
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: prefixer.prefix(_objectSpread({
          width: '100%'
        }, innerViewWrapperStyle))
      }, _this.props.renderView({
        index: index,
        active: index === activeView,
        transitionState: _this.getTransitionState(index)
      })));
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "animateHeight", function () {
      var _this$getDefaultedPro2 = _this.getDefaultedProps(),
          animateHeight = _this$getDefaultedPro2.animateHeight,
          fillParent = _this$getDefaultedPro2.fillParent,
          keepViewsMounted = _this$getDefaultedPro2.keepViewsMounted;

      return animateHeight && !fillParent && !keepViewsMounted;
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "rootRef", function (node) {
      _this.root = node;

      var _this$getDefaultedPro3 = _this.getDefaultedProps(),
          rootRef = _this$getDefaultedPro3.rootRef;

      if (rootRef) rootRef(node);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "viewportRef", function (node) {
      _this.viewport = node;

      var _this$getDefaultedPro4 = _this.getDefaultedProps(),
          viewportRef = _this$getDefaultedPro4.viewportRef;

      if (viewportRef) viewportRef(node);
    });
    return _this;
  }

  (0, _createClass2["default"])(ViewSlider, [{
    key: "setTimeout",
    value: function (_setTimeout) {
      function setTimeout(_x, _x2, _x3) {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    }(function (name, callback, delay) {
      if (this.timeouts[name]) clearTimeout(this.timeouts[name]);
      this.timeouts[name] = setTimeout(callback, delay);
    })
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var _this2 = this;

      var _this$getDefaultedPro5 = this.getDefaultedProps(),
          activeView = _this$getDefaultedPro5.activeView,
          transitionDuration = _this$getDefaultedPro5.transitionDuration,
          keepViewsMounted = _this$getDefaultedPro5.keepViewsMounted;

      var newState;

      if (activeView !== this.state.activeView && this.state.height === undefined) {
        if (keepViewsMounted) {
          // scroll all views except the current back to the top
          for (var i = 0; i < this.views.length; i++) {
            if (i === this.state.activeView) continue;
            if (this.views[i]) this.views[i].scrollTop = 0;
          }
        } // phase 1: set current height


        newState = {
          height: this.measureHeight(this.views[this.state.activeView])
        };
      } else if (this.state.height !== undefined && !this.state.transitioning) {
        // phase 2: enable transitions
        newState = {
          transitioning: true
        };
      } else if (activeView !== this.state.activeView) {
        // phase 3: change height/activeView
        newState = {
          activeView: activeView,
          numViews: Math.max(this.state.numViews, activeView + 1),
          prevActiveView: this.state.activeView,
          height: this.measureHeight(this.views[activeView])
        };
      }

      var finalNewState = newState;
      if (!finalNewState) return;
      this.setState(finalNewState, function () {
        if (finalNewState.activeView != null) {
          _this2.setTimeout('onTransitionEnd', _this2.onTransitionEnd, transitionDuration);
        }
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      for (var _name in this.timeouts) {
        clearTimeout(this.timeouts[_name]);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$getDefaultedPro6 = this.getDefaultedProps(),
          style = _this$getDefaultedPro6.style,
          className = _this$getDefaultedPro6.className,
          viewportClassName = _this$getDefaultedPro6.viewportClassName,
          viewportStyle = _this$getDefaultedPro6.viewportStyle,
          prefixer = _this$getDefaultedPro6.prefixer,
          fillParent = _this$getDefaultedPro6.fillParent,
          transitionDuration = _this$getDefaultedPro6.transitionDuration,
          transitionTimingFunction = _this$getDefaultedPro6.transitionTimingFunction,
          keepViewsMounted = _this$getDefaultedPro6.keepViewsMounted,
          rtl = _this$getDefaultedPro6.rtl,
          spacing = _this$getDefaultedPro6.spacing;

      var animateHeight = this.animateHeight();
      var _this$state3 = this.state,
          activeView = _this$state3.activeView,
          numViews = _this$state3.numViews,
          height = _this$state3.height,
          transitioning = _this$state3.transitioning;

      var finalOuterStyle = _objectSpread({
        transitionProperty: 'height',
        transitionDuration: "".concat(transitionDuration, "ms"),
        transitionTimingFunction: transitionTimingFunction,
        overflow: 'hidden',
        height: animateHeight && height != null ? height : undefined
      }, style);

      var finalViewportStyle = _objectSpread({
        position: 'relative',
        transform: "translateX(calc(".concat(activeView * spacing * (rtl ? 100 : -100), "% + 0px))"),
        whiteSpace: 'nowrap',
        minHeight: '100%',
        direction: rtl ? 'rtl' : 'ltr',
        transition: transitioning ? "transform ".concat(transitionTimingFunction, " ").concat(transitionDuration, "ms") : undefined
      }, viewportStyle);

      if (fillParent) {
        Object.assign(finalOuterStyle, fillStyle);
        Object.assign(finalViewportStyle, fillStyle);
      } // when not transitioning, render empty placeholder divs before the active view to push it into the right
      // horizontal position


      var views = [];

      for (var i = 0; i < (transitioning || keepViewsMounted ? numViews : activeView + 1); i++) {
        views[i] = this.renderView(i);
      }

      return /*#__PURE__*/React.createElement("div", {
        style: prefixer.prefix(finalOuterStyle),
        className: className,
        ref: this.rootRef
      }, /*#__PURE__*/React.createElement("div", {
        className: viewportClassName,
        style: prefixer.prefix(finalViewportStyle),
        ref: this.viewportRef,
        onTransitionEnd: this.onTransitionEnd
      }, views));
    }
  }]);
  return ViewSlider;
}(React.Component);

exports["default"] = ViewSlider;