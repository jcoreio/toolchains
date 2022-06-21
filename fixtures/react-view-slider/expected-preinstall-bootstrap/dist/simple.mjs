import _extends from "@babel/runtime/helpers/extends";

/* eslint-env browser */
import * as React from 'react';
import Prefixer from 'inline-style-prefixer';
import ViewSlider from './index';
var bpfrpt_proptype_Props = {
  "children": PropTypes.any,
  "keepViewsMounted": PropTypes.bool,
  "keepPrecedingViewsMounted": PropTypes.bool,
  "animateHeight": PropTypes.bool,
  "transitionDuration": PropTypes.number,
  "transitionTimingFunction": PropTypes.string,
  "onSlideTransitionEnd": PropTypes.func,
  "prefixer": function () {
    return (typeof Prefixer === "function" ? PropTypes.instanceOf(Prefixer) : PropTypes.any).apply(this, arguments);
  },
  "fillParent": PropTypes.bool,
  "className": PropTypes.string,
  "style": PropTypes.object,
  "viewportClassName": PropTypes.string,
  "viewportStyle": PropTypes.object,
  "viewStyle": PropTypes.object,
  "innerViewWrapperStyle": PropTypes.object,
  "rootRef": PropTypes.func,
  "viewportRef": PropTypes.func,
  "rtl": PropTypes.bool,
  "spacing": PropTypes.number
};
var bpfrpt_proptype_State = {
  "views": PropTypes.node.isRequired,
  "activeView": PropTypes.number.isRequired
};

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

    static propTypes = {
      "children": PropTypes.any,
      "keepViewsMounted": PropTypes.bool,
      "keepPrecedingViewsMounted": PropTypes.bool,
      "animateHeight": PropTypes.bool,
      "transitionDuration": PropTypes.number,
      "transitionTimingFunction": PropTypes.string,
      "onSlideTransitionEnd": PropTypes.func,
      "prefixer": function () {
        return (typeof Prefixer === "function" ? PropTypes.instanceOf(Prefixer) : PropTypes.any).apply(this, arguments);
      },
      "fillParent": PropTypes.bool,
      "className": PropTypes.string,
      "style": PropTypes.object,
      "viewportClassName": PropTypes.string,
      "viewportStyle": PropTypes.object,
      "viewStyle": PropTypes.object,
      "innerViewWrapperStyle": PropTypes.object,
      "rootRef": PropTypes.func,
      "viewportRef": PropTypes.func,
      "rtl": PropTypes.bool,
      "spacing": PropTypes.number
    };
  };
}
export default createSimpleViewSlider(ViewSlider);
import { bpfrpt_proptype_Props as bpfrpt_proptype_ViewSliderProps } from "./index";
import { bpfrpt_proptype_ViewProps } from "./index";
import PropTypes from "prop-types";
export { bpfrpt_proptype_Props };
export { bpfrpt_proptype_State };