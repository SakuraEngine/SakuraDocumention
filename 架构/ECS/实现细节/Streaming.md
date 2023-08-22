---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
需要流式的加载/运算数据集。
# 方案解析
把数据集拆分为多个 Storage，分为主 Storage 和流式 Storage。
加载数据的时候先加载到流式的 Storage，然后搬移到主 Storage。
流式 Storage 的加载可以异步的进行。
类似的，Group 的加载和 Instantiate 也可以用这种方式来异步进行。
# 代码用例

```cpp
storage main;
storage stream;
archive file("chunk1");
auto job = dispatch([&]{ stream.deserialize(&file); });
loop
{
	//other work
	if(job.done())
    	main.merge(std::move(stream));
}
```

# 实现细节
- 注意对 Entity 进行引用修复，不光要修复数据中的引用，还要修复 Chunk 本身。
- 引用修复可能可以多线程加速。
- 注意整体搬移方式也可能形成 Chunk 碎片（大量只有很少 Entity 的 Chunk），考虑在恰当的时机整理碎片。
