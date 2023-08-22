---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
Entity 之间可能存在相互的引用，而这些相互引用的 Entity 可能是逻辑上的一个整体单元，也就是强引用，强引用的对象需要同步它们的生命周期。
# 方案解析
对象生命周期的管理应该由上层来做，框架提供一些工具来支持，具体涉及到的生命周期接口有：
- Instantiate - 提供实例化一组对象的能力，并保证这组对象之间的相互引用维持不变
- Serialize/Deserialize - 同上
- Destroy - 用户自主管理
# 实现细节
- 内置一个 Prefab 的概念，这是一组特殊的 Entity，他们的 id 为 [0, 1, 2, 3...] 的序列。在操作的时候，先把 Entity 特化到 Prefab，然后基于 Prefab 进行  Instantiate 和  Serialize/Deserialize，能简化接下来引用修复的代码。
> 注意：组的外部引用的 id 可能在 [0, 1, 2, 3...] 范围内，则 Patch 之后会产生意料之外的 Alaise 问题，要处理这个问题可以使用 Version 的一个 Magic Number 来区分 Prefab 的 Entity 和外部的 Entity。

- 引用修复可能可以进行多线程加速。
- 最佳实践：递归销毁操作难以进行 Batch，可能造成潜在的性能损失，大型分组考虑直接 [[Meta Type|切割内存]]（比如 SceneSection）
