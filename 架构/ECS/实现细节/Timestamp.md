---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
需要跟踪数据的更新以实现增量式更新。
# 方案分析
给数据加上时间戳，根据时间戳来判定数据的版本信息。可以标记时间戳的地方有：

- Type Timestamp，代表 Type 上**数据表**的更新。
- Chunk Data Timestamp，代表 Chunk 中每一个 Type 的**数据**的更新。
- Archetype Timestamp，代表 Archetype 上**数据表**的更新。

