import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import {
  createOverflowFollow,
  type OverflowFollowController,
  type OverflowFollowOptions,
} from 'overflow-follow';
import './style.css';

export type OverflowFollowElementRef<T extends HTMLElement = HTMLElement> = Readonly<Ref<T | null>>;

/**
 * 在 Vue 3 中复用溢出跟随逻辑。
 *
 * viewportRef 对应裁切区域，contentRef 对应真实宽度的单行内容。
 * options 可以是普通对象或 computed，适合由组件 props 派生配置。
 */
export function useOverflowFollow(
  viewportRef: OverflowFollowElementRef,
  contentRef: OverflowFollowElementRef,
  options: OverflowFollowOptions | ComputedRef<OverflowFollowOptions> = {},
) {
  const controller = shallowRef<OverflowFollowController | null>(null);
  const resolveOptions = () => ('value' in options ? options.value : options);

  const stopElementsWatch = watch(
    [viewportRef, contentRef],
    ([viewport, content], _previous, onCleanup) => {
      if (!viewport || !content) return;

      const instance = createOverflowFollow(viewport, content, resolveOptions());
      controller.value = instance;

      onCleanup(() => {
        instance.destroy();
        if (controller.value === instance) controller.value = null;
      });
    },
    { immediate: true, flush: 'post' },
  );

  const stopOptionsWatch = watch(
    () => resolveOptions(),
    (value) => controller.value?.updateOptions(value),
    { deep: true },
  );

  onBeforeUnmount(() => {
    stopElementsWatch();
    stopOptionsWatch();
  });

  return {
    controller,
    refresh: () => controller.value?.refresh(),
    reset: () => controller.value?.reset(),
  };
}

/**
 * Vue 3 开箱即用组件。
 * 默认插槽适合文本、图标、状态标签等非交互展示内容；交互元素请使用 composable 自定义结构。
 */
export const OverflowFollow = defineComponent({
  name: 'OverflowFollow',
  props: {
    text: { type: String, default: '' },
    resetOnLeave: { type: Boolean, default: true },
    keyboard: { type: Boolean, default: true },
    keyboardStep: { type: Number, default: 0.05 },
    disabled: { type: Boolean, default: false },
    tabindex: { type: Number, default: 0 },
  },
  setup(props, { slots, expose }) {
    const viewportRef = shallowRef<HTMLElement | null>(null);
    const contentRef = shallowRef<HTMLElement | null>(null);
    const options = computed<OverflowFollowOptions>(() => ({
      resetOnLeave: props.resetOnLeave,
      keyboard: props.keyboard,
      keyboardStep: props.keyboardStep,
      disabled: props.disabled,
    }));
    const api = useOverflowFollow(viewportRef, contentRef, options);

    expose({ refresh: api.refresh, reset: api.reset });

    return () =>
      h(
        'div',
        {
          ref: viewportRef,
          class: 'overflow-follow',
          tabindex: props.keyboard && !props.disabled ? props.tabindex : undefined,
        },
        [
          h(
            'span',
            { ref: contentRef, class: 'overflow-follow__content' },
            slots.default?.() ?? props.text,
          ),
        ],
      );
  },
});

export type { OverflowFollowController, OverflowFollowOptions } from 'overflow-follow';
export default OverflowFollow;
