# overflow-follow

框架无关的指针跟随溢出内容控制器。完整文档与示例请查看 [Overflow Follow](https://github.com/ss548/overflow-follow)。

A framework-agnostic pointer-following overflow content controller. See [Overflow Follow](https://github.com/ss548/overflow-follow/blob/main/README.en-US.md) for the complete English documentation and examples.

```ts
import { createOverflowFollow } from 'overflow-follow';

const controller = createOverflowFollow(viewport, content);
controller.destroy();
```
