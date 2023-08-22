---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
Chunk 中 Entity 的数量差距很大，固定的 Chunk 大小不太合适。

# 方案解析
根据 Entity 的数量启发式的调整 Chunk 的大小，具体细节为：

- 一次分配较少的 Entity，且当前小 Chunk 数量低于阈值时，分配新的小 Chunk
- 分配教多的 Entity，直接分配大 Chunk
- 否则分配普通 Chunk
- 序列化的时候，尽量将 Chunk 合并为大 Chunk 再序列化
