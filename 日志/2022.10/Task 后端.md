---
create: 2023-04-23 21:40
aliases: []
tags: [TaskSystem]
---
我们重构了任务系统，在当前 FiberTaskingLib 的基础上，增加了 Marl 的后端实现，并使用了一套共同的接口将他们统一起来。Marl 和 FTL 的实现有许多不同之处：

- 在 Counter 的实现上，FTL 采用了 Push 的方案，在 Counter 计数完成时，由 Counter 主动对所有等待的任务进行唤醒，而 Marl 则使用了 Pull 的方案，任务对其等待的 Counter 进行轮询（这样可以支持更复杂的条件）。
- 在调度上，FTL 对任务和纤程采用了相同的调度方案（WorkStealing），而 Marl 则只对任务进行复杂调度，对纤程则不会进行跨线程调度。

虽然这意味着在有着复杂依赖的时候，FTL 会比 Marl 有更高的填充率，但实际数据还需要我们继续测试收集。
