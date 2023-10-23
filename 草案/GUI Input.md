---
create: 2023-10-20 14:53
aliases: []
tags: []
---
## Event Design
### 输入系统分类
- Keyboard（键盘）
- Pointer（鼠标）
- Touch（触屏）
- Gamepad（手柄）
- Other... e.g. VR...
### 输入事件设计
UI 的输入千奇百怪，但对于 UI 系统来说，只需要关注一组特殊的 Schema，外界负责将 `device input` 映射到 `logic input`，同时，为了满足对特定输入的数据感知，需要提供携带用户数据的方式，同时，外界需要知晓事件是否被处理。故，事件设计如下：
```cpp
struct Event {
	GUID tid;       // UI 系统已知的类型 ID，用于框架代码对事件进行处理
	GUID user_tid;  // 用户的类型 ID，用于携带用户数据
};
```

## Event Dispatch
延续并扩展 Flutter 的手势设计，并对于基础事件（Down/Up/Move/Hover）引入[[Input|路由机制]]。

对于 Focus 问题，Input 流送的第一目标永远是 Widget，而 Focus 的改变，则由在控件接收到事件之后决定，自动化的 Focus 也嵌入在这一层中