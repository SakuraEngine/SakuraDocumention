---
create: 2023-10-18 17:43
aliases: []
tags: []
---

## 序列化
由于一些 header-only 库的引入，序列化的实现 header 会带来极大的编译负担（尤其是 simdjson），针对这一问题，提出以下解决方案：
- 对具体类型的特化：将实现迁至 CPP 中，用静态链接隔离实现
- 对目标类型的特化：使用 `xxxx.json_write.hpp`、`xxxx.json_read.hpp` 来隔离 serde 实现，由于这类目标并不是非常多，header 数量是相对可控的

## RTTR
RTTRTraits 的实现相对比较轻量，对于模板类型可以比较方便的嵌入在模板的 header 内
