"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSimpleViewSlider = createSimpleViewSlider;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _inlineStylePrefixer = _interopRequireDefault(require("inline-style-prefixer"));
var _index = _interopRequireDefault(require("./index.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-env browser */
function defaultRenderView({
  index
}) {
  return this.state.views[index];
}
function createSimpleViewSlider(ViewSlider, renderView = defaultRenderView) {
  return class SimpleViewSlider extends React.Component {
    constructor(props) {
      super(props);
      const child = React.Children.only(props.children);
      const activeView = parseInt(child.key);
      const views = [];
      views[activeView] = child;
      this.state = {
        views,
        activeView
      };
    }
    componentDidUpdate(prevProps) {
      if (prevProps.children !== this.props.children) {
        const child = React.Children.only(this.props.children);
        const activeView = parseInt(child.key);
        const views = [...this.state.views];
        views[activeView] = child;
        this.setState({
          views,
          activeView
        });
      }
    }
    renderView = renderView.bind(this);
    handleSlideTransitionEnd = () => {
      if (!this.props.keepViewsMounted) {
        const {
          views,
          activeView
        } = this.state;
        if (activeView < views.length - 1) {
          this.setState({
            views: views.slice(0, activeView + 1)
          }, () => {
            const {
              onSlideTransitionEnd
            } = this.props;
            if (onSlideTransitionEnd) onSlideTransitionEnd();
          });
        }
      }
    };
    render() {
      const {
        children,
        // eslint-disable-line no-unused-vars
        // Flow's React.ComponentType + defaultProps is foobar...
        spacing,
        rtl,
        keepViewsMounted,
        keepPrecedingViewsMounted,
        ...props
      } = this.props;
      const {
        activeView,
        views
      } = this.state;
      return /*#__PURE__*/React.createElement(ViewSlider, (0, _extends2.default)({}, props, {
        keepViewsMounted: keepViewsMounted || keepPrecedingViewsMounted,
        spacing: spacing,
        rtl: rtl,
        renderView: this.renderView,
        numViews: views.length,
        activeView: activeView,
        onSlideTransitionEnd: this.handleSlideTransitionEnd
      }));
    }
  };
}
var _default = createSimpleViewSlider(_index.default);
exports.default = _default;
//# sourceMappingURL=simple.js.map