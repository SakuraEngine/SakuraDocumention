---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
同一个类型的 Entity 放置在连续内存中，但是要避免昂贵的数组重分配。
# 解决方案
将 Entity 的数据拆解到有（相对）固定的物理大小的 Chunk 中。
通过一个独立的 Archetype 来描述 Chunk 的 Layout，也就是每个 Field 的大小和偏移。
通过 Group 来管理 Chunk，其带有更复杂的类型信息：Tag Component 和 [[Meta Type|Meta Component]]，两个 Group 可能指向同一个 Archetype。
# 实现细节
- 类型集合 Type Set 用排序后的数组实现，可加速后续的操作，因为 Set 是 const 的，只会排序一次。
- 是否为 Buffer 可以通过位域压缩到类型的 Index 上，然后经过排序可以获得字典序 \[c,c,c,c,b,b,b]。
- Component 的内存排布顺序应该按照 Hash 排序以保证不变性
- 
- 类型处理（比如获取添加组件后的类型）会产生临时数据，可以用一个 stack allocator 来避免分配。
- Entity Id Allocator 可以用侵入式 Freelist。
- 当在两个有同样 Archetype 的 Group 之间搬移时，可以整体搬移 Chunk，但要注意这可能形成 Chunk 碎片（大量只有少量 Entity 的 Chunk），考虑在适当的时机整理。
