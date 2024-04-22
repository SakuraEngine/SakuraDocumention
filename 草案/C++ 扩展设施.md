---
create: 2024-04-17 18:13
aliases: []
tags: []
---
## 对象模型
- Record：对应 C++ 的 struct/class，简单的记录其信息
- Object：抽象概念，一般为 IObject 子类，默认的 RTTR 服务提供方式，包括 get_type 和 cast
- Interface：特殊的 Record，标记此类为 interface，会尽量进行行为约束（只能有函数）
- Pattern：模式匹配，一般用于在静态代码中替代 Interface 或书写更加脚本亲和的代码，在反射中呈现为一个独立的类目
	- 静态使用：使用编译期检查保证匹配
	- 动态使用：一般配合 IObject 进行使用，通过 RTTR 匹配签名来进行动态装载
	- 脚本使用：通过统一导出范式绑定脚本调用，在调用时包装 Pattern 的 vtable