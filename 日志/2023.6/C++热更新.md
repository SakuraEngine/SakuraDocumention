引擎目前已有两个蝇量级的热更手段：TWEAK&INSPECT，通过简单的宏对常量进行 Hook，并通过文本解析或 GUI 对常量进行运行时的微调。
现在引入第三个轻量级热更方案：HotfixModule，其只提供了最基础的代码热更功能：加载动态库，更新 Module 实例。除此之外不提供其他的处理；这意味着包括 lambda 函数，和虚函数在内的函数指针都不会被更新到，用户在 HotfixModule 中应该限制它们的使用 - 此热更方案主要目标是简单的过程式逻辑。
后续对函数指针的处理正在考虑中。
