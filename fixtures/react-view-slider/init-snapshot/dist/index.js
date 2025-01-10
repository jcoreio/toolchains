"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultProps = exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _inlineStylePrefixer = _interopRequireDefault(require("inline-style-prefixer"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/* eslint-env browser */
const fillStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};
const baseViewStyle = {
  display: 'inline-block',
  verticalAlign: 'top',
  whiteSpace: 'normal',
  width: '100%'
};
const defaultProps = exports.defaultProps = {
  animateHeight: true,
  transitionDuration: 500,
  transitionTimingFunction: 'ease',
  keepViewsMounted: false,
  prefixer: new _inlineStylePrefixer.default(),
  style: {},
  viewportStyle: {},
  rtl: false,
  spacing: 1
};
function applyDefaults(props) {
  const result = {
    ...props
  };
  for (const key in defaultProps) {
    if (Object.prototype.hasOwnProperty.call(defaultProps, key) && props[key] == null) {
      result[key] = defaultProps[key];
    }
  }
  return result;
}
class ViewSlider extends React.Component {
  state = {
    height: undefined,
    transitioning: false,
    activeView: this.props.activeView,
    numViews: this.props.numViews,
    // this is used to determine the correct transitionState for the previous active view.
    prevActiveView: null
  };
  views = [];
  timeouts = {};
  lastProps = this.props;
  getDefaultedProps = () => {
    if (this.lastProps !== this.props || !this.lastDefaultedProps) {
      this.lastProps = this.props;
      this.lastDefaultedProps = applyDefaults(this.props);
    }
    return this.lastDefaultedProps;
  };
  measureHeight = node => {
    if (!node) return null;
    return node.clientHeight;
  };
  setTimeout(name, callback, delay) {
    if (this.timeouts[name]) clearTimeout(this.timeouts[name]);
    this.timeouts[name] = setTimeout(callback, delay);
  }
  componentDidUpdate() {
    const {
      activeView,
      transitionDuration,
      keepViewsMounted
    } = this.getDefaultedProps();
    let newState;
    if (activeView !== this.state.activeView && this.state.height === undefined) {
      if (keepViewsMounted) {
        // scroll all views except the current back to the top
        for (let i = 0; i < this.views.length; i++) {
          if (i === this.state.activeView) continue;
          if (this.views[i]) this.views[i].scrollTop = 0;
        }
      }
      // phase 1: set current height
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
        activeView,
        numViews: Math.max(this.state.numViews, activeView + 1),
        prevActiveView: this.state.activeView,
        height: this.measureHeight(this.views[activeView])
      };
    }
    const finalNewState = newState;
    if (!finalNewState) return;
    this.setState(finalNewState, () => {
      if (finalNewState.activeView != null) {
        this.setTimeout('onTransitionEnd', this.onTransitionEnd, transitionDuration);
      }
    });
  }
  onTransitionEnd = event => {
    // ignore transitionend events from deeper components
    if (event && event.target !== this.viewport) return;
    // phase 0: unset height and disable transitions
    this.setState({
      height: undefined,
      numViews: this.props.numViews,
      prevActiveView: null,
      transitioning: false
    }, () => {
      const {
        onSlideTransitionEnd
      } = this.props;
      if (onSlideTransitionEnd) onSlideTransitionEnd();
    });
  };
  componentWillUnmount() {
    for (let name in this.timeouts) clearTimeout(this.timeouts[name]);
  }
  getTransitionState = childIndex => {
    const {
      activeView,
      prevActiveView
    } = this.state;
    if (prevActiveView == null) return childIndex === activeView ? 'in' : 'out';
    if (childIndex === activeView) return 'entering';
    if (childIndex === prevActiveView) return 'leaving';
    return 'out';
  };
  renderView = index => {
    const {
      fillParent,
      prefixer,
      keepViewsMounted,
      spacing,
      rtl,
      viewStyle,
      innerViewWrapperStyle
    } = this.getDefaultedProps();
    const {
      activeView,
      transitioning
    } = this.state;
    const style = {
      ...baseViewStyle,
      ...viewStyle
    };
    if (fillParent) {
      Object.assign(style, fillStyle);
      style.overflow = 'auto';
      if (rtl) style.right = `${index * spacing * 100}%`;else style.left = `${index * spacing * 100}%`;
    } else if (index > 0) {
      if (rtl) style.marginRight = `${(spacing - 1) * 100}%`;else style.marginLeft = `${(spacing - 1) * 100}%`;
    }

    // when not transitioning, render empty placeholder divs before the active view to push it into the right
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
      ref: c => this.views[index] = c
    }, /*#__PURE__*/React.createElement("div", {
      style: prefixer.prefix({
        width: '100%',
        ...innerViewWrapperStyle
      })
    }, this.props.renderView({
      index,
      active: index === activeView,
      transitionState: this.getTransitionState(index)
    })));
  };
  animateHeight = () => {
    const {
      animateHeight,
      fillParent,
      keepViewsMounted
    } = this.getDefaultedProps();
    return animateHeight && !fillParent && !keepViewsMounted;
  };
  rootRef = node => {
    this.root = node;
    const {
      rootRef
    } = this.getDefaultedProps();
    if (rootRef) rootRef(node);
  };
  viewportRef = node => {
    this.viewport = node;
    const {
      viewportRef
    } = this.getDefaultedProps();
    if (viewportRef) viewportRef(node);
  };
  render() {
    const {
      style,
      className,
      viewportClassName,
      viewportStyle,
      prefixer,
      fillParent,
      transitionDuration,
      transitionTimingFunction,
      keepViewsMounted,
      rtl,
      spacing
    } = this.getDefaultedProps();
    const animateHeight = this.animateHeight();
    const {
      activeView,
      numViews,
      height,
      transitioning
    } = this.state;
    const finalOuterStyle = {
      transitionProperty: 'height',
      transitionDuration: `${transitionDuration}ms`,
      transitionTimingFunction,
      overflow: 'hidden',
      height: animateHeight && height != null ? height : undefined,
      ...style
    };
    const finalViewportStyle = {
      position: 'relative',
      transform: `translateX(calc(${activeView * spacing * (rtl ? 100 : -100)}% + 0px))`,
      whiteSpace: 'nowrap',
      minHeight: '100%',
      direction: rtl ? 'rtl' : 'ltr',
      transition: transitioning ? `transform ${transitionTimingFunction} ${transitionDuration}ms` : undefined,
      ...viewportStyle
    };
    if (fillParent) {
      Object.assign(finalOuterStyle, fillStyle);
      Object.assign(finalViewportStyle, fillStyle);
    }

    // when not transitioning, render empty placeholder divs before the active view to push it into the right
    // horizontal position
    const views = [];
    for (let i = 0; i < (transitioning || keepViewsMounted ? numViews : activeView + 1); i++) {
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
}
exports.default = ViewSlider;
//# sourceMappingURL=index.js.map