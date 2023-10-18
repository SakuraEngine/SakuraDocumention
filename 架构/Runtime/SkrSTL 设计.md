---
create: 2023-06-05 14:43
aliases: 
tags:
  - CPP
---
## 设计初衷
天下苦 STL 久矣
### STL 的缺陷
- 平台不稳定的实现，甚至跨版本 ABI 稳定在近期才有所改善
- 简陋单一的 Allocator 设计，内存来源仅依赖这一个 Allocator，无法实现 Fixed 与 SSO 布局
- 硬编码的堆内存来源，改变来源的同时会直接改变容器的签名，并且在跨 Dll 传输时释放会直接 crash
- 丑陋的迭代器范式，All In Iterator，难以阅读且编码效率低下
- 执着于通用范式，忽略了容器本身与其实现方式的强相关性，导致功能大量缺失
- Cache 不友好的设计，大量分配碎片堆内存，导致效率低下
- 元素 Move/Copy 等操作控制力低下，无法更改且行为不透明
- 容器算法控制力低下，且指定 Hash/Key 的方式非常繁琐
- 容器布局不稳定，并且是个黑盒，无法通过类型系统进行类型擦除的干涉
- 迭代器名不副实且异常复杂，划分了好几个种类，并且引入了大量的模板元魔法
- 环境冲突，当一个环境下存在多套指定 Allocator 的容器时，容易发生混乱
### 对容器的需求
- 完善的增删改查接口，并且对构造方式要有精确的控制
- 易于指定的堆内存 Source，并且不会改变容器签名
- Fixed 与 SSO 支持
- Add/Remove/Find 的返回不是迭代器，而是简单且易于理解的结构化信息
- 尽量深入的容器算法控制力，在某些高性能场景能够使用不安全操作优化高频调用
- 对元素 Move/Copy 等行为尽量深入的控制，可以支持某些特殊的元素类型
- 稳定的内存布局，方便进行带类型擦除的操作
- 尽量连续的内存分配，提高 Cache 命中率
- 清晰明确的算法层，一种数据结构对应一个特定容器

## 设计
### MemoryTraits
MemoryTraits 司掌元素的内存操作（Move/Copy/Dtor/Ctor 等）
### Allocator
Allocator 司掌容器的内存分配以及分配策略（内存来源不由 Allocator 管理）
### Arena
Arena 为 Allocator 提供堆内存分配的入口
### Container Traits
Container Traits 控制容器的算法，比如指定 Hasher、Key、是否允许重复 Key 存在等
### DataRef
DataRef 用于索引某个特定的容器成员，常用于 Find/Remove/Add 等的返回，这个 Ref 是不安全的，仅为了给出单步操作的结果，其有效区间视 API 而定
### Iterator
Iterator 并不遵循 STL 的设计范式，但是提供 begin/end 来支持 foreach 语法
### Hasher
Hasher 提供元素的 Hash 方式，并且支持模式匹配的方式快速指定 Hash 路径
### Profiling
Profiling 是一项需求驱动的后期工作，主要提供内存快照，调用 Counter，容器性能评估等工作
## 容器
### Array
线性容器，并集成了 BinarySearch、Heap、Stack、等常线性容器常用功能，堆内存分配的主要目的是元素 Array
### BitArray
用于节省内存的 Boolean 容器，堆内存分配的主要目的是 BitBlocks
### SparseArray
线性容器，与 Array 的不同点是增删元素后，元素的 Index 不会发生变动，并且具有 O(1) 的元素 Remove 和 Insert 性能，其缺点是当存在过多空穴的时候，需要 Compact 来进行优化，堆内存分配的主要目的是元素以及其对应的 BitBlock
### SparseHashSet
基于 SparseArray 的 HashSet，其思路是通过内联一个双向链表作为 Bucket 串出来的链表，并通过一个额外的 Bucket 来索引链表头，其中索引都通过 Index 进行，其好处是即便发生内存重新分配，也可以保证稳定的索引，由于基于 SparseArray，其内存访问是连续的，并且可以进行排序操作，也可以通过元素重排，提高检索效率。堆内存分配的主要目的是元素、BitBlock 以及一个 HashBucket。
### SparseHashMap
基于 HashSet，本质是将元素替换为 `Pair<K, V>`，在算法层面并没有变化，分配也与 SparseHashSet 保持一致。