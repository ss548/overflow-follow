import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue-demi';
import {
  createOverflowFollow,
  type OverflowFollowController,
  type OverflowFollowOptions,
} from 'overflow-follow';
import './style.css';

export type OverflowFollowElementRef<T extends HTMLElement = HTMLElement> = Readonly<Ref<T | null>>;

/** Vue 2.6/2.7 composable；Vue 2.6 项目需要安装 @vue/composition-api。 */
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

/** Vue 2 开箱即用组件，插槽仅建议放置非交互展示内容。 */
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
  setup(props, { slots }) {
    const viewportRef = shallowRef<HTMLElement | null>(null);
    const contentRef = shallowRef<HTMLElement | null>(null);
    const options = computed<OverflowFollowOptions>(() => ({
      resetOnLeave: props.resetOnLeave,
      keyboard: props.keyboard,
      keyboardStep: props.keyboardStep,
      disabled: props.disabled,
    }));
    useOverflowFollow(viewportRef, contentRef, options);

    return () =>
      h(
        'div',
        {
          ref: viewportRef,
          class: 'overflow-follow',
          attrs: {
            tabindex: props.keyboard && !props.disabled ? props.tabindex : undefined,
          },
        },
        [
          h(
            'span',
            { ref: contentRef, class: 'overflow-follow__content' },
            slots.default?.() ?? [props.text],
          ),
        ],
      );
  },
});

export type { OverflowFollowController, OverflowFollowOptions } from 'overflow-follow';
export default OverflowFollow;
