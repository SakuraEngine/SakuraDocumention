---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
* 对于 Component 的数据，因为是二进制兼容的，直接存盘即可。
- 对于 Type 的数据，注意要保存为 hash 值来保证稳定性。
需要考虑的是引用类型和数据包。
引用按持久化需求分为：
- 临时引用
- 持久引用
引用按作用域分为：
- 内部引用
- 外部引用
持久引用可以实现为 GUID + pointer，内存重叠，在两种形式中切换
- pointer -> 持久化 -> GUID
- GUID -> 读取 -> pointer
分 Database 和 Entity 两个序列化粒度来考虑
# Database
可以用快照的方式将整个数据库保存下来， Entity Ref 不会被破坏。
但是 External Ref 并不一定是持续化的引用（如对象指针。
所以**需要对其进行持续化处理**并替换原引用再进行序列化。
这个替换对数据库是破坏性的，所以应该：
1. _先克隆一份 Database_
2. 对其进行持续化处理
3. _进行快照并存盘_
4. _删除克隆_
对于反序列化，对应的步骤为：
1. _读取快照到 Loading Database_
2. 进行实例化（反持续化）处理 
3. _合并到 Main Database_
其中斜体部分应该由 API 提供
## 碎片
在保存整个 Database 的时候，Entity Id 因为采用了 Freelist，是不保证连续的，但是在序列化的时候也不需要整理，在反序列化后合并到 Main Database 的时候会执行一次整理。
如果真实存在空间浪费的情况，可以对 Entity Id 进行一次整理：按数量重新分配 Entity 并进行 Patch，整个过程是相对比较耗时的。
合并到 Main Database 的时候一般是采取整体 Chunk 搬移的形式来减少消耗，但在反复执行合并操作之后可能产生碎片 Chunk，可以视情况对 Chunk 进行整理，按 Archetype 中所有 Entity 的实际数量计算出最佳分布，然后搬移到最佳分布上。
# Entity
序列化 Entity 的时候
- 不一定只会序列化一个 Entity，对于 Group 需要整体进行序列化
- Entity Ref 和 External Ref 都可能被破坏。
External Ref 的思路保持不变，Entity Ref 需要考虑：
- 对于内部引用（Group 内），可以参考[对应细节](https://www.yuque.com/awiag7/hevwby/df1gl9)，先转化为 Prefab 避免 Patch 消耗。
- 对于外部引用
   - 可以考虑通过 GUID 将引用持续化，与 External Ref 不同的是，GUID 是附加信息而不是替换组件。
   - 可以考虑直接丢弃临时的引用。
> API 提供了 `gather_reference` 和 `patch` 来提供持续化和实例化的执行。

总结一下流程，对于序列化：
1. 复制一份 Entity/Group，并转化为 Prefab
2. 执行 External Ref 和 Entity Ref 的持续化处理
3. 序列化 Prefab
4. 删除复制品
对于反序列化：
1. 反序列化 Prefab，并实例化为 Entity/Group
2. 执行 Externa Ref 和 Entity Ref 的实例化处理
> 不同于 Database 的序列化，在序列化 Entity 的时候尽量的重排列了 Entity ID
