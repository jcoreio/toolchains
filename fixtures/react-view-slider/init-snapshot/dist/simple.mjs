import _extends from "@babel/runtime/helpers/extends";
/* eslint-env browser */
import * as React from 'react';
import Prefixer from 'inline-style-prefixer';
import ViewSlider from "./index.mjs";
function defaultRenderView({
  index
}) {
  return this.state.views[index];
}
export function createSimpleViewSlider(ViewSlider, renderView = defaultRenderView) {
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
      return /*#__PURE__*/React.createElement(ViewSlider, _extends({}, props, {
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
export default createSimpleViewSlider(ViewSlider);