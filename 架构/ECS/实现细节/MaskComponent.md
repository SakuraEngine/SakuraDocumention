---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
存在高频增删 Component 的情况，考虑避免 StructuralChange 带来的性能负担。

# 方案解析
维护一个 Mask 来进行单位粒度的筛选。

# 实现细节

- Mask 可以通过 Archetype 的局部 TypeId 进行，这可以将 bit 的位数控制得很低（也就是单个 Entity 上 Component 的数量）
- 考虑 None 筛选的话，会导致 Archetype 的筛选失效，可能需要 LOD 来优化开销，也就是分别在 Chunk 层级和 Archetype 层级记录一个 Mask，其值为下级的值的 and 运算结果。
- 可以考虑分帧对被 Mask 的 Entity 进行聚合操作（相同 Archetype 的 Entity 聚合到一起）来抵消部分 Mask 带来的缓存未命中。
