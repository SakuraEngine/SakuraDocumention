---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
对象的筛选和对象的操作往往是一起出现的，需要一种范式描述这种模式。
# 方案解析
将这种模式定义为 Query - 查询，并使用一个 DSL 来描述查询[[Data Flow]]：
- 数据操作
   - 读写
      - in
      - inout
      - out
      - atomic
   - 顺序
      - par
      - seq
      - uneq
   - 阶段
      - '+
- 数据筛选
   - 集合筛选
      - optional - ?
      - none - !
   - 共享筛选*
      - shared - $
将以上设计组合起来按以下顺序排列：读写、顺序、共享、集合、阶段，则有示例：
```
movement - [in]velocity, [inout]location'
extended movement - [in]velocity, [in]acceleration, [inout]location'
transform rls - [in]rotation,[in]location,[in]?scale,[out]transform
transform hls - [in]heading,[in]?up,[in]location,[in]?scale,[out]transform
transform hierachy - [in]!parent,[in]children,[inout][rand]transform
```

