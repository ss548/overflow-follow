# Overflow Follow

[简体中文](./README.md) | [English](./README.en-US.md)

让横向溢出的单行内容跟随指针位置展示。没有惯性、没有自动播放：指针位于容器左侧、中间、右侧时，分别展示内容的开头、中间和末尾；指针离开后立即复位。

作者：**ss548**

在线演示：<https://ss548.github.io/overflow-follow/>

## 特性

- 指针位置与内容偏移一一对应，可随时左右移动
- 从上方、下方或侧面进入时立即定位到正确位置
- 离开区域后回到内容开头
- 使用 `ResizeObserver` 适配 Flex、Grid、窗口缩放和动态内容
- 无动画依赖、无惯性、无运行时框架耦合
- 同时提供原生 JavaScript、Vue 3、Vue 2 和 React 版本
- TypeScript 编写，发布包包含 JavaScript 和类型声明

## 安装

```bash
# 原生 JavaScript / TypeScript
pnpm add overflow-follow

# Vue 3
pnpm add overflow-follow-vue

# Vue 2.7
pnpm add overflow-follow-vue2 vue-demi

# Vue 2.6 还需要 Composition API 插件
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
  <OverflowFollow text="一段非常长的文件路径或其他单行内容" />
</template>
```

组件样式继承调用方的 `color`、`font` 和 `letter-spacing`，不需要使用样式穿透。也可以使用插槽：

```vue
<OverflowFollow class="path">
  <span>图标</span>
  <span>一段非常长的内容</span>
</OverflowFollow>
```

默认插槽是展示型插槽，内部设置了 `pointer-events: none`。按钮、输入框和链接等交互内容应当使用 composable 自定义 DOM：

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

Vue 2 的 API 与 Vue 3 包保持一致：

> Vue 2 已停止维护。该包用于兼容既有项目，新项目应优先使用 Vue 3 版本。依赖审计可能继续报告来自 Vue 2 本身的已知问题。

```ts
import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
import { OverflowFollow } from 'overflow-follow-vue2';
import 'overflow-follow-vue2/style.css';

// 仅 Vue 2.6 需要这一行；Vue 2.7 不需要安装插件。
Vue.use(VueCompositionAPI);
```

## React

```tsx
import { OverflowFollow } from 'overflow-follow-react';
import 'overflow-follow-react/style.css';

export function FilePath() {
  return <OverflowFollow text="一段非常长的文件路径或其他单行内容" />;
}
```

## 原生 JavaScript

```ts
import { createOverflowFollow } from 'overflow-follow';

const viewport = document.querySelector<HTMLElement>('.viewport')!;
const content = document.querySelector<HTMLElement>('.content')!;
const controller = createOverflowFollow(viewport, content);

// 不再使用时移除监听和观察器
controller.destroy();
```

对应的基础样式：

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

## 配置

| 参数           | 类型                         | 默认值  | 说明                              |
| -------------- | ---------------------------- | ------- | --------------------------------- |
| `resetOnLeave` | `boolean`                    | `true`  | 指针离开后回到开头                |
| `keyboard`     | `boolean`                    | `true`  | 启用 Home、End 和左右方向键       |
| `keyboardStep` | `number`                     | `0.05`  | 每次方向键移动的比例              |
| `disabled`     | `boolean`                    | `false` | 禁用并复位                        |
| `onProgress`   | `(progress: number) => void` | —       | 进度变化回调，仅核心和 hooks 支持 |

组件不会生成 `aria-label`。如果内容本身没有可读文本，可由业务侧根据上下文补充无障碍名称。

## 本地开发

```bash
pnpm install
pnpm dev
pnpm check
```

## License

[MIT](./LICENSE)
