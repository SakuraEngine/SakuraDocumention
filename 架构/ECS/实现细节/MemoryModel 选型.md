---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
对于应用程序的性能，主要有三个方面的因素：

- 多线程：计算的扩展性
- LOD：计算的有效性
- 缓存：数据的有效性

而 ECS 内存模型是用来解决缓存问题的内存数据库。
# 方案解析
## 简述
缓存命中有两个要素：

- 信息的有效性：访问对象时，整个对象都应该参与算法
- 信息的连续性：访问对象时，对象应该尽量的连续

缓存是一段线性的内存，用来填充线性内存的最佳方案就是数组，则有如下推导：

- 拆解对象，取对象有效的部分
- 使用对象的数组

简称切片和打组。常用的手段称为 SOA，即 struct of array。
有了这两个工具，就面临了两个选择 

- 先切片后打组
- 先打组后切片

两种方式都是可行的，其中

- 先切片后打组 - SparseArray，打组也有不同的方式：Group 和 HBV
- 先打组后切片 - Archetype

下面分别说明两个方案，考虑：
```cpp
array<entity*> entities;
```

## SparseArray
横向切片：
```cpp
struct entities
{
    sparse_array<component>;//切片
    sparse_array<component>;
    slot_allocator;
};
```
每一种 Component 自成一张表（Sparse Array)，遍历的时候把需要的表 Join 到一起（打组）（一般有个 Primary Column）：
```cpp
select A, B from join(sparse_array<A>, sparse_array<B>);
```

## Archtype
打组后切片：
```cpp
struct entities
{
    struct archetypes //打组
    {
        optional<array<component>>; //切片
        optional<array<component>>;
    };
    array<archetypes>;
    indirect_array; //随机访问
    slot_allocator;
}
```
每一种 entity 自成一张表（Archetype），遍历的时候把需要的表 Append 到一起：
```cpp
select A,B from archetype where archetype.match(A, B);
```

## 总结
下面针对两种选择的各方面进行一个对比。


| **需求\\构架** | **SparseArray** | **Archetype** |
| --- | --- | --- |
| 数据结构 | SoA | AoSoA |
| 无GC | √ | √ |
| 查询效率 | A | A |
| SIMD | B | S |
| 缓存命中率 | A，查询相关 | S，类型相关 |
| 简洁性 | A | A |
| 增删性能 | S | B |
| 随机访问 | S | A |
| 内存节省 | A | A |
| 可排序 | √ | × |
| 动态类型 | √ | √ |
| 多线程友好 | A | S |
| 序列化效率 | A | S |

