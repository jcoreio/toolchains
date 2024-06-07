/* @flow */
/* eslint-env browser */

import * as React from 'react';
import { prefix } from 'inline-style-prefixer';
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
export const defaultProps = {
  animateHeight: true,
  transitionDuration: 500,
  transitionTimingFunction: 'ease',
  keepViewsMounted: false,
  prefixer: prefix,
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
export default class ViewSlider extends React.Component {
  state = {
    height: undefined,
    transitioning: false,
    activeView: this.props.activeView,
    numViews: this.props.numViews,
    // this is used to determine the correct transitionState for the previous active view.
    prevActiveView: undefined
  };
  root;
  viewport;
  views = [];
  timeouts = {};
  lastProps = this.props;
  lastDefaultedProps;
  getDefaultedProps = () => {
    if (this.lastProps !== this.props || !this.lastDefaultedProps) {
      this.lastProps = this.props;
      this.lastDefaultedProps = applyDefaults(this.props);
    }
    return this.lastDefaultedProps;
  };
  measureHeight = node => {
    if (!node) return undefined;
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
          const view = this.views[i];
          if (view) view.scrollTop = 0;
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
    this.setState({
      ...this.state,
      ...finalNewState
    }, () => {
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
      prevActiveView: undefined,
      transitioning: false
    }, () => {
      const {
        onSlideTransitionEnd
      } = this.props;
      if (onSlideTransitionEnd) onSlideTransitionEnd();
    });
  };
  componentWillUnmount() {
    for (const name in this.timeouts) clearTimeout(this.timeouts[name]);
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
        style: prefixer(style)
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: prefixer(style),
      ref: c => this.views[index] = c ?? undefined
    }, /*#__PURE__*/React.createElement("div", {
      style: prefixer({
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
    this.root = node ?? undefined;
    const {
      rootRef
    } = this.getDefaultedProps();
    if (rootRef) rootRef(node);
  };
  viewportRef = node => {
    this.viewport = node ?? undefined;
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
      style: prefixer(finalOuterStyle),
      className: className,
      ref: this.rootRef
    }, /*#__PURE__*/React.createElement("div", {
      className: viewportClassName,
      style: prefixer(finalViewportStyle),
      ref: this.viewportRef,
      onTransitionEnd: this.onTransitionEnd
    }, views));
  }
}
//# sourceMappingURL=index.mjs.map