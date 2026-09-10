# Overflow Follow

[简体中文](./README.md) | [English](./README.en-US.md)

Display horizontally overflowing single-line content according to the pointer position. There is no inertia or autoplay: when the pointer is at the left, center, or right of the container, the beginning, middle, or end of the content is shown. The content resets immediately after the pointer leaves.

Author: **ss548**

Live demo: <https://ss548.github.io/overflow-follow/>

## Features

- Maps the pointer position directly to the content offset and supports instant direction changes
- Locates the correct content position when entering from the top, bottom, or either side
- Resets to the beginning when the pointer leaves
- Uses `ResizeObserver` to support Flex, Grid, window resizing, and dynamic content
- No animation dependency, inertia, autoplay, or framework coupling in the core
- Supports Vanilla JavaScript, Vue 3, Vue 2, and React
- Written in TypeScript and published with JavaScript bundles and type declarations

## Installation

```bash
# Vanilla JavaScript / TypeScript
pnpm add overflow-follow

# Vue 3
pnpm add overflow-follow-vue

# Vue 2.7
pnpm add overflow-follow-vue2 vue-demi

# Vue 2.6 also requires the Composition API plugin
pnpm add overflow-follow-vue2 vue-demi @vue/composition-api

# React
pnpm add overflow-follow-react
```

## Vue 3

```vue
<script setup lang="ts">
import { OverflowFollow } from 'overflow-follow-vue';
import 'overflow-follow-vue/style.css';
</script>

<template>
  <OverflowFollow text="A very long file path or other single-line content" />
</template>
```

The component inherits `color`, `font`, and `letter-spacing` from the consumer, so scoped-style piercing is unnecessary. A slot is also available:

```vue
<OverflowFollow class="path">
  <span>Icon</span>
  <span>A very long piece of content</span>
</OverflowFollow>
```

The default slot is intended for presentational content and uses `pointer-events: none`. Use the composable with custom markup when the content includes interactive elements such as buttons, inputs, or links:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useOverflowFollow } from 'overflow-follow-vue';

const viewport = useTemplateRef<HTMLElement>('viewport');
const content = useTemplateRef<HTMLElement>('content');
const { reset, refresh } = useOverflowFollow(viewport, content);
</script>

<template>
  <div ref="viewport" class="viewport">
    <div ref="content" class="content">...</div>
  </div>
</template>
```

## Vue 2

The Vue 2 package follows the same API as the Vue 3 package.

> Vue 2 is no longer maintained. This adapter is provided for existing projects. New projects should prefer Vue 3, and dependency audits may continue to report known issues originating from Vue 2 itself.

```ts
import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
import { OverflowFollow } from 'overflow-follow-vue2';
import 'overflow-follow-vue2/style.css';

// Required only for Vue 2.6. Vue 2.7 does not need the plugin.
Vue.use(VueCompositionAPI);
```

## React

```tsx
import { OverflowFollow } from 'overflow-follow-react';
import 'overflow-follow-react/style.css';

export function FilePath() {
  return <OverflowFollow text="A very long file path or other single-line content" />;
}
```

## Vanilla JavaScript

```ts
import { createOverflowFollow } from 'overflow-follow';

const viewport = document.querySelector<HTMLElement>('.viewport')!;
const content = document.querySelector<HTMLElement>('.content')!;
const controller = createOverflowFollow(viewport, content);

// Remove listeners and observers when the controller is no longer needed.
controller.destroy();
```

Required base styles:

```css
.viewport {
  min-width: 0;
  overflow: hidden;
}
.content {
  display: inline-flex;
  width: max-content;
  white-space: nowrap;
}
```

## Options

| Option         | Type                         | Default | Description                                       |
| -------------- | ---------------------------- | ------- | ------------------------------------------------- |
| `resetOnLeave` | `boolean`                    | `true`  | Reset to the beginning after the pointer leaves   |
| `keyboard`     | `boolean`                    | `true`  | Enable Home, End, and horizontal arrow keys       |
| `keyboardStep` | `number`                     | `0.05`  | Progress moved by each arrow-key press            |
| `disabled`     | `boolean`                    | `false` | Disable interaction and reset the content         |
| `onProgress`   | `(progress: number) => void` | —       | Progress callback available in the core and hooks |

The components do not generate an `aria-label`. Consumers can provide an accessible name when the rendered content itself contains no readable text.

## Local development

```bash
pnpm install
pnpm dev
pnpm check
```

## License

[MIT](./LICENSE)
