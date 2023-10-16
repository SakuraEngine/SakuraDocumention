---
create: 2023-04-23 21:40
aliases: []
tags: [ECS, BuildSystem/Codegen]
---
得利于[[状态同步示例]]中大量的 ECS 实践，修复了大量 ECS 实现中的错误，并补全了 ECS 上层 C++接口的设计工作。此次更新包含了针对 query 的两层全新的封装。
拿一个简单的例子来说
```C++
query = dualQ_from_literal("[in]speed, [inout]position, !static");
dualJ_schedule_ecs(query, +[](void* u, dual_query_t* query, dual_chunk_view_t* view, dual_type_index_t* localTypes, EIndex entityIndex)
{
	//             ↓↓↓↓↓↓                 ↓↓↓↓               ↓↓↓↓ 
	auto speeds = (speed_t*)dualV_get_owned_ro(view, localTypes[0]);
	auto positions = (float3_t*)dualV_get_owned_ro(view, localTypes[1]);
	...
}, ...);
```
在之前的 API 中，虽然 query 本身的构造已经通过一个简单的 dsl 进行了足够的简化，但是在实现 task 代码的时候却不仅带有大量的 boilerplate code 还非常的危险：
* `dualV_get_owned_xx(view, localTypes` 会复制粘贴多次
* `(speed_t*)` 强制转型，没有类型检查
* ro/rw 没有检查，如果和 query 本身没有对应上则 UB
* `localTypes[0]` 表示 query 中的第 0 个参数，没有检查，增删参数容易错位
## C++ Query
C++ 层是建立在老的接口之上的封装层，主要做了一些安全性的改进，在封装之后的代码如下：
```c++
dual::schedual_task(query, [](dual::task_context_t ctx)
{
	auto speeds = ctx.get_owned_ro<speed_t>(0);
	auto positions = ctx.get_owned_ro<position_t>(1);
}, ...);
```
* 不再需要使用 `localTypes`
* 转型带有可选的运行时检查
* ro/rw 带有可选的运行时检查
* 参数类型带有可选的运行时检查
## Codegen Query
在设计 query 的构建的 api 的时候，之所以选择了一个简单 dsl 而没有使用一个 builder 的原因其一是因为基础的 ecs api 采用了 c 接口，对 builder 并不友好，其二是通过字符串 dsl 可以轻松的使得其他语言也能使用，其三则是适配 codegen。新的基于 codegen 的 api 如下：
```c++
sreflect_struct("query" : "[in]speed, [inout]position, !static")
struct Q
{ GENERATED_QUERY_BODY() };
Q query;
dual::schedual_task(query, [](Q::TaskContext ctx)
{
	auto [speeds, positions] = ctx.unpack();
}, ...);
```
其中 Q 会展开为
```c++
struct Q::TaskContext : private dual::task_cnntext_t
{
	struct View
	{
		const speed_t* _speed_t;
		const position_t* _position_t;
	};
	View unpack();
	const speed_t* get(type_t<speed_t>) { return super::get_owned_ro<speed_t, false>(0); }
	...
};
```
基于 codegen 的 API 真正做到了 dsl 和 C++ 之间的适配，将 dsl 展开为了有效的 C++ 代码，所以可以直接使用编译期的类型检查而不必再执行运行时的检查，并且代码也更加的简单优雅。
