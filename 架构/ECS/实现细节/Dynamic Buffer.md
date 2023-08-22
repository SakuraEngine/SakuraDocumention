---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
动态缓存是非常常见的需求

- HealthModifyQueue
- Childs
- Items
- Overlaped
# 方案解析
动态缓存需要追踪生命周期，但是因为他行为可预测，再加上其和其他特性的边界问题：Serialize，[[Patch]] 等，如果采用回调的形式会带来性能损失，所有的操作都可以在框架内硬编码完成。
需要关注的地方有：

- Construct：Add
- Copy：Instantiate
- Destruct：Remove，Destroy
- [[Patch]] 
# 实现细节
在 chunk 的层面实现这些功能，涉及的部分有

- Construct Chunk：Add
- Cast Chunk：Add/Remove
- Destruct Chunk：Remove
- Patch Chunk
- Serialize Chunk

类型信息需要新增：

- elementSize ：用于在 Patch 的时候遍历元素。

可选的优化方式有：

- Short Array Optimization
- Memory Pool
