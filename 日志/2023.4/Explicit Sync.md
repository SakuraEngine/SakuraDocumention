---
create: 2023-04-23 22:19
aliases: []
tags: [ECS, TaskSystem]
---
删除了 `dualV_get_xx` 系列 API 中的隐式同步行为，转而要求用户在访问之前使用  `dualQ_sync` 等接口显式的进行同步。
在修改之后立即暴露出了之前代码中的多处 query 与实际访问不一致的情况，证明了这次改动方向的正确性。