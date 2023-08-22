---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题
需要一个添加 chunk 自定义数据的方案，用例为：

- 简单的加速结构，比如记录整个 chunk 内是否有可视的 entity
- 用于记录与外部直接映射的信息（比如只记录 chunk 内第一个 entity 对应的 index，不需要每个 entity 记录 index）
# 方案解析
首先 chunk data 的类型系统应当和组件兼容
那么需要考虑的是 chunk data 的内存布局，考虑几个方案：

1. 直接作为组件挂载到 entity 上，然后 chunk 引用一个 entity
2. 特殊处理，放置在 chunk 外
3. 特殊处理，放置在 chunk 内

考虑几个问题：

- chunk data 的 query 和 access 形式
- 如何处理 chunk data 的线程同步问题
- chunk data 的生命周期

对于第一个方案，如果采用 entity 作为 chunk data，也就是类似于 meta table 的做法，好处是除了通过 chunk，还可以通过 entity 自己 native 的方式（query，access 等）来访问到数据，但是这个好处并没有任何意义，因为从需求看来，**chunk data 更多的是代表 chunk 内数据的一个整合，并没有单独访问的必要**，且和 meta table 中的只读访问不同，chunk data 是需要写入的，这会带来更复杂的线程同步问题。
对于第二三个方案，**把 chunk data 本身和 chunk 的生命周期绑定比较符合直觉**，所以内存绑定也更加自然。
对于第三个方案，放置在 chunk 中代表需要相应的修改 chunk layout，也就是需要修改 archetype 记录的信息，同时很自然的，chunk data 应该成为一个 component，编码到 entity type 中。
通过这些选择，**chunk data 的 access 和 query 和普通 component 的 API 完全一致**，同一个 chunk 内的 entity 都会 access 到同一个 chunk data，**用户的遍历逻辑仍然需要相应的修改，不能对 chunk data 进行遍历**。
线程同步问题中，chunk data 和普通 component 最大的区别在于分配任务时**不能再分配 subchunk 的 task，否则会有读写冲突问题。**
