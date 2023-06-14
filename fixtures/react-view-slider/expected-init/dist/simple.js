"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bpfrpt_proptype_State = exports.bpfrpt_proptype_Props = void 0;
exports.createSimpleViewSlider = createSimpleViewSlider;
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _inlineStylePrefixer = _interopRequireDefault(require("inline-style-prefixer"));

var _index = _interopRequireWildcard(require("./index.js"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _excluded = ["children", "spacing", "rtl", "keepViewsMounted", "keepPrecedingViewsMounted"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } } /* eslint-env browser */

var bpfrpt_proptype_Props = {
  "children": _propTypes["default"].any,
  "keepViewsMounted": _propTypes["default"].bool,
  "keepPrecedingViewsMounted": _propTypes["default"].bool,
  "animateHeight": _propTypes["default"].bool,
  "transitionDuration": _propTypes["default"].number,
  "transitionTimingFunction": _propTypes["default"].string,
  "onSlideTransitionEnd": _propTypes["default"].func,
  "prefixer": function prefixer() {
    return (typeof _inlineStylePrefixer["default"] === "function" ? _propTypes["default"].instanceOf(_inlineStylePrefixer["default"]) : _propTypes["default"].any).apply(this, arguments);
  },
  "fillParent": _propTypes["default"].bool,
  "className": _propTypes["default"].string,
  "style": _propTypes["default"].object,
  "viewportClassName": _propTypes["default"].string,
  "viewportStyle": _propTypes["default"].object,
  "viewStyle": _propTypes["default"].object,
  "innerViewWrapperStyle": _propTypes["default"].object,
  "rootRef": _propTypes["default"].func,
  "viewportRef": _propTypes["default"].func,
  "rtl": _propTypes["default"].bool,
  "spacing": _propTypes["default"].number
};
exports.bpfrpt_proptype_Props = bpfrpt_proptype_Props;
var bpfrpt_proptype_State = {
  "views": _propTypes["default"].node.isRequired,
  "activeView": _propTypes["default"].number.isRequired
};
exports.bpfrpt_proptype_State = bpfrpt_proptype_State;

function defaultRenderView(_ref) {
  var index = _ref.index;
  return this.state.views[index];
}

function createSimpleViewSlider(ViewSlider) {
  var _class;

  var renderView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultRenderView;
  return _class = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SimpleViewSlider, _React$Component);

    var _super = _createSuper(SimpleViewSlider);

    function SimpleViewSlider(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, SimpleViewSlider);
      _this = _super.call(this, props);
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "renderView", renderView.bind((0, _assertThisInitialized2["default"])(_this)));
      (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "handleSlideTransitionEnd", function () {
        if (!_this.props.keepViewsMounted) {
          var _this$state = _this.state,
              views = _this$state.views,
              activeView = _this$state.activeView;

          if (activeView < views.length - 1) {
            _this.setState({
              views: views.slice(0, activeView + 1)
            }, function () {
              var onSlideTransitionEnd = _this.props.onSlideTransitionEnd;
              if (onSlideTransitionEnd) onSlideTransitionEnd();
            });
          }
        }
      });
      var child = React.Children.only(props.children);

      var _activeView = parseInt(child.key);

      var _views = [];
      _views[_activeView] = child;
      _this.state = {
        views: _views,
        activeView: _activeView
      };
      return _this;
    }

    (0, _createClass2["default"])(SimpleViewSlider, [{
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
          var child = React.Children.only(this.props.children);
          var activeView = parseInt(child.key);
          var views = (0, _toConsumableArray2["default"])(this.state.views);
          views[activeView] = child;
          this.setState({
            views: views,
            activeView: activeView
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            children = _this$props.children,
            spacing = _this$props.spacing,
            rtl = _this$props.rtl,
            keepViewsMounted = _this$props.keepViewsMounted,
            keepPrecedingViewsMounted = _this$props.keepPrecedingViewsMounted,
            props = (0, _objectWithoutProperties2["default"])(_this$props, _excluded);
        var _this$state2 = this.state,
            activeView = _this$state2.activeView,
            views = _this$state2.views;
        return /*#__PURE__*/React.createElement(ViewSlider, (0, _extends2["default"])({}, props, {
          keepViewsMounted: keepViewsMounted || keepPrecedingViewsMounted,
          spacing: spacing,
          rtl: rtl,
          renderView: this.renderView,
          numViews: views.length,
          activeView: activeView,
          onSlideTransitionEnd: this.handleSlideTransitionEnd
        }));
      }
    }]);
    return SimpleViewSlider;
  }(React.Component), (0, _defineProperty2["default"])(_class, "propTypes", {
    "children": _propTypes["default"].any,
    "keepViewsMounted": _propTypes["default"].bool,
    "keepPrecedingViewsMounted": _propTypes["default"].bool,
    "animateHeight": _propTypes["default"].bool,
    "transitionDuration": _propTypes["default"].number,
    "transitionTimingFunction": _propTypes["default"].string,
    "onSlideTransitionEnd": _propTypes["default"].func,
    "prefixer": function prefixer() {
      return (typeof _inlineStylePrefixer["default"] === "function" ? _propTypes["default"].instanceOf(_inlineStylePrefixer["default"]) : _propTypes["default"].any).apply(this, arguments);
    },
    "fillParent": _propTypes["default"].bool,
    "className": _propTypes["default"].string,
    "style": _propTypes["default"].object,
    "viewportClassName": _propTypes["default"].string,
    "viewportStyle": _propTypes["default"].object,
    "viewStyle": _propTypes["default"].object,
    "innerViewWrapperStyle": _propTypes["default"].object,
    "rootRef": _propTypes["default"].func,
    "viewportRef": _propTypes["default"].func,
    "rtl": _propTypes["default"].bool,
    "spacing": _propTypes["default"].number
  }), _class;
}

var _default = createSimpleViewSlider(_index["default"]);

exports["default"] = _default;