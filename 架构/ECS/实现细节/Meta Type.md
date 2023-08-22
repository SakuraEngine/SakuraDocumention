---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
而 Filter 由 Type 组成，Type 是静态的，则 Filter 也是静态的。
# 方案解析
为了解除这个限制，需要对 Type 进行扩展，从静态扩展到动态。
把这个动态的扩展叫做 Meta Type。
Meta Type 有以下特性：
- 在运行时生成
- 唯一性（Handle）
- 储存在 Entity Type 中（也就是 Archetype 中）
现在面临三个选择：
1. 把 Meta Type 作为独立的扩展。
2. 把 Meta Type 作为 Type 的附加状态。（让 Meta Type 也有对应的 Type）
3. 把 Entity 作为 Meta Type。
第一种选择非常简单直白，只满足了动态分组，称之为 Meta Handle。
第二种选择会提供查询的能力：从 Type 查询 Meta Type，概念靠近 Component，有概念上的统一性，称之为 Meta Component。
而前两种的 Meta Type 都可以同时作为外部数据结构的一个 Handle，从而作为一个共享的数据引用。
第三种选择则直接用了内部的 Handle 作为 Meta Type，内聚性更强，内部的数据共享提供了继承与覆写的可能性，称之为 Meta Entity。
# 缺陷分析
## 性能
增加结构复杂度往往就意味着性能的下降。
随着 Meta Type 的使用，数据会随之被碎片化，有如下代价：
- 缓存命中率降低
- 内存消耗变高
- 查询效率变低
但是[[StrongRef|某些条件下]]聪明的使用也可以提升性能。
## Meta Handle & Meta Component
需要一个额外的机制保证 Meta Type 的唯一性，扩展性欠佳。
## Meta Entity
Meta Entity 的继承与覆写会带来更复杂的所有权问题
# 实现细节
## Meta Component
扩展 Entity Type，添加 Meta Type Set。
## Group
额外使用结构 Group 管理 Chunk，Archetype 作为 Chunk Layout 的描述。
# 情景列举
- 鱼群的 Target，一个鱼群共享一个
- 子场景的 Entity，按子场景 ID 分组，卸载