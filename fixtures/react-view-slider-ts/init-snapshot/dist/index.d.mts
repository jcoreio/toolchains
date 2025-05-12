import * as React from 'react';
import { Prefix as Prefixer } from 'inline-style-prefixer';
type TransitionState = 'in' | 'out' | 'entering' | 'leaving';
export type ViewProps = {
  index: number;
  active: boolean;
  transitionState: TransitionState;
};
export type DefaultProps = {
  animateHeight: boolean;
  keepViewsMounted: boolean;
  transitionDuration: number;
  transitionTimingFunction: string;
  prefixer: Prefixer;
  style: Record<string, any>;
  viewportStyle: Record<string, any>;
  rtl: boolean;
  spacing: number;
};
export type Props = {
  activeView: number;
  numViews: number;
  renderView: (props: ViewProps) => React.ReactNode;
  keepViewsMounted?: boolean;
  animateHeight?: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  onSlideTransitionEnd?: () => unknown;
  prefixer?: Prefixer;
  fillParent?: boolean;
  className?: string;
  style?: Record<string, any>;
  viewportClassName?: string;
  viewportStyle?: Record<string, any>;
  viewStyle?: Record<string, any>;
  innerViewWrapperStyle?: Record<string, any>;
  rootRef?: (node: React.ElementRef<'div'>) => unknown;
  viewportRef?: (node: React.ElementRef<'div'>) => unknown;
  rtl?: boolean;
  spacing?: number;
};
type DefaultedProps = {
  activeView: number;
  numViews: number;
  renderView: (props: ViewProps) => React.ReactNode;
  keepViewsMounted: boolean;
  animateHeight: boolean;
  transitionDuration: number;
  transitionTimingFunction: string;
  prefixer: Prefixer;
  fillParent?: boolean;
  className?: string;
  style: Record<string, any>;
  viewportClassName?: string;
  viewportStyle: Record<string, any>;
  viewStyle?: Record<string, any>;
  innerViewWrapperStyle?: Record<string, any>;
  rootRef?: (node: React.ElementRef<'div'> | null) => unknown;
  viewportRef?: (node: React.ElementRef<'div'> | null) => unknown;
  rtl: boolean;
  spacing: number;
};
export type State = {
  height?: number;
  transitioning: boolean;
  activeView: number;
  numViews: number;
  prevActiveView?: number;
};
export declare const defaultProps: DefaultProps;
export default class ViewSlider extends React.Component<Props, State> {
  state: State;
  root: HTMLDivElement | undefined;
  viewport: HTMLDivElement | undefined;
  views: Array<HTMLElement | undefined>;
  timeouts: {
    [name: string]: any;
  };
  lastProps: Props;
  lastDefaultedProps: DefaultedProps | undefined;
  getDefaultedProps: () => DefaultedProps;
  measureHeight: (node: HTMLElement | undefined) => number | undefined;
  setTimeout(name: string, callback: () => any, delay: number): void;
  componentDidUpdate(): void;
  onTransitionEnd: (event?: React.TransitionEvent<HTMLDivElement>) => void;
  componentWillUnmount(): void;
  getTransitionState: (childIndex: number) => TransitionState;
  renderView: (index: number) => React.ReactNode;
  animateHeight: () => boolean;
  rootRef: (node: React.ElementRef<"div"> | null) => void;
  viewportRef: (node: React.ElementRef<"div"> | null) => void;
  render(): React.ReactElement<'div'>;
}
export {};
//# sourceMappingURL=index.d.mts.map