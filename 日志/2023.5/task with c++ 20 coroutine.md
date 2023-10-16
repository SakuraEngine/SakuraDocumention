---
create: 2023-05-13 23:37
aliases: []
tags: [TaskSystem, c++20, coroutine]
---
coroutine 相比于 fiber，属于纯粹的语言 feature，fiber 是保存了整个函数的上下文，而 coroutine 是通过编译器分析指定调用点的最小上下文，所以理论上 coroutine 的上下文会小很多。
并且相比 fiber 通过覆盖寄存器来跳转上下文，coroutine 的调用机制和函数完全相同，这也意味着 fiber 是对称协程，而 coroutine 是非对称协程，fiber 可以随机跳转而 coroutine 只能回到 caller。
使用 coroutine 实现 task system 非常方便，因为 coroutine 的非对称性质，Worker 并不需要区分 task 是一个普通函数还是 coroutine，coroutine suspend 之后控制流就回到 Worker 了，和函数别无二致。然后等 event signal 的时候再次把 suspend 的 coroutine 给提交到 worker 即可继续执行，实践下来实现所需的代码比 marl 要少上一半左右。
下面是大概的 API 样貌：
```c++
int a = 0;
event_t event;
schedule([](int& a, event_t event) -> task_t
{
	a = 10;
	event_t event2;
	schedule([&]()
	{
		a += 10;
		event2.notify();
	});
	co_await wait(event2);
	a += 10;
	event.notify();
}(a, event));
sync(event);
EXPECT_EQ(a, 30);
```
比较难受的是，lambda 和 coroutine 的结合有很大的缺陷 - 捕获对协程不生效，lambda 本体的结构体生命周期并不会跟随协程而是在调用后结束，所以协程 lambda 不能捕获。
参见 [C++ Core Guidelines (isocpp.github.io)](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rcoro-capture)