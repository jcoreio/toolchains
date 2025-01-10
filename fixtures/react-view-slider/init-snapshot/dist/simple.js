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
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
var _default = exports.default = createSimpleViewSlider(_index.default);
//# sourceMappingURL=simple.js.map