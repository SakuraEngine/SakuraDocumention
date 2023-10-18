---
create: 2023-04-24 08:14
aliases: 
tags:
  - HAL
  - Input
---
## HAL 层
整体对 [GameInput](https://learn.microsoft.com/en-us/gaming/gdk/_content/gc/input/overviews/input-overview) 进行跨平台的封装，主要由以下几个结构组成：
* Input - 输入的实例，包含主要的 API
* InputLayer - 用于处理 Fallback 的层，当前有 GameInput 和 Common 两种实现
* InputReading - 单个输入数据
* InputDevice - 输入设备
## 用户层
用户层的构成如下：
* Mapping - 将 HAL 层的输入信息映射为一个向量
	* Modifier - 对向量进行变换
* Action - 管理用户注册的回调
	* Trigger - 具体管理什么时候触发回调

流程参考 [[InputSystem.canvas]]