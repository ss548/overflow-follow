import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  createOverflowFollow,
  type OverflowFollowController,
  type OverflowFollowOptions,
} from 'overflow-follow';
import './style.css';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** 在 React 中把两个 DOM ref 连接到框架无关核心。 */
export function useOverflowFollow(
  viewportRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: OverflowFollowOptions = {},
) {
  const controllerRef = useRef<OverflowFollowController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useBrowserLayoutEffect(() => {
    if (!viewportRef.current || !contentRef.current) return;

    const controller = createOverflowFollow(
      viewportRef.current,
      contentRef.current,
      optionsRef.current,
    );
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [viewportRef, contentRef]);

  useEffect(() => {
    controllerRef.current?.updateOptions(options);
  }, [
    options.disabled,
    options.keyboard,
    options.keyboardStep,
    options.onProgress,
    options.resetOnLeave,
  ]);

  return controllerRef;
}

export interface OverflowFollowHandle {
  refresh: () => void;
  reset: () => void;
}

export interface OverflowFollowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  text?: string;
  resetOnLeave?: boolean;
  keyboard?: boolean;
  keyboardStep?: number;
  disabled?: boolean;
  contentClassName?: string;
}

/** React 开箱即用组件，children 仅建议放置非交互展示内容。 */
export const OverflowFollow = forwardRef<OverflowFollowHandle, OverflowFollowProps>(
  function OverflowFollow(
    {
      children,
      text = '',
      resetOnLeave = true,
      keyboard = true,
      keyboardStep = 0.05,
      disabled = false,
      contentClassName = '',
      className = '',
      tabIndex = 0,
      ...rest
    },
    forwardedRef,
  ) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLSpanElement>(null);
    const controllerRef = useOverflowFollow(viewportRef, contentRef, {
      resetOnLeave,
      keyboard,
      keyboardStep,
      disabled,
    });

    useImperativeHandle(
      forwardedRef,
      () => ({
        refresh: () => controllerRef.current?.refresh(),
        reset: () => controllerRef.current?.reset(),
      }),
      [controllerRef],
    );

    return (
      <div
        {...rest}
        ref={viewportRef}
        className={`overflow-follow ${className}`.trim()}
        tabIndex={keyboard && !disabled ? tabIndex : undefined}
      >
        <span ref={contentRef} className={`overflow-follow__content ${contentClassName}`.trim()}>
          {children ?? text}
        </span>
      </div>
    );
  },
);

export type { OverflowFollowController, OverflowFollowOptions } from 'overflow-follow';
export default OverflowFollow;
