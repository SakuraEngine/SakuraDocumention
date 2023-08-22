---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
数据更新的顺序可能存在依赖。
# 方案解析
因为数据表是无顺序的，如果要进行强顺序的更新，那么必须引入一个 Key 进行 Random Access，而相关的数据流也要全部下降到 Random Access，且 Key 会在数据流之间来回跳跃（当只有一条数据流的时候影响最小，但也会打乱其子数据流）。
而解决跳跃问题的方式就是拆分数据表，把依赖从数据之间的依赖整理到数据表之间的依赖，从而尽量保证拆分后的数据表内部不存在任何依赖，拆分的方式不唯一，拆分的程度也不唯一。
# 缺陷分析

- 不拆数据表
   - 在子数据流之间跳跃会有缓存开销。
   - 在数据流之间跳跃会有缓存和类型检查的双重开销。
   - 有限的多线程（当依赖为树形的时候，子树可以并行）。
- 拆分数据表
   - 为了拆分数据表，增加了数据的碎片性，有缓存开销
   - 同样的，数据流也跟随数据表被拆分，导致复杂度大大增加
   - 为了维护大量数据表，引入大量的 Structural Change 开销
# 代码示例
拆头尾
```cpp
(Rotation, Location, LocalToParent) => LocalToParent = (Location, Rotation);
(Rotation, Location, LocalToWorld, !LocalToParent) => 
    LocalToWorld = (Location, Rotation);
var RecLTW = (e, pltw) => 
    ltw = LocalToParent[e] * pltw; //跳跃开销
	if(Childs?e) //类型检查开销
    	for(var child in Childs[e])
    		RecLTW(e, LocalToWorld[e] = pltw);
(!Parent, LocalToWorld, Childs) => //有限的并行
    for(var child in Childs)
    	RecLTW(e, LocalToWorld);
```
拆层
```cpp
LayerMeta lm;
lm = TopLayer;
(Rotation, Location, LocalToWorld, !Parent) => LocalToWorld = (Location, Rotation);
for(int i=TopLayer;i>=0;--i) //碎片化的数据表和数据流
    lm = i;
	(Rotation, Location, LocalToWorld, Parent, META.lm) => 
        LocalToWorld = (Location, Rotation) * LocalToWorld[Parent];
```
