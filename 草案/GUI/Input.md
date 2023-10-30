---
create: 2023-10-20 14:53
aliases: []
tags: []
---
## Input & Event
### Event
#### 输入系统分类
- Keyboard（键盘）
- Pointer（鼠标）
- Touch（触屏）
- Gamepad（手柄）
- Other... e.g. VR...
####  输入事件设计
UI 的输入千奇百怪，但对于 UI 系统来说，只需要关注一组特殊的 Schema，外界负责将 `device input` 映射到 `logic input`，同时，为了满足对特定输入的数据感知，需要提供携带用户数据的方式，同时，外界需要知晓事件是否被处理。故，事件使用简单的数据继承，由于 RTTR 提供类型转换服务
#### Event Dispatch
延续并扩展 Flutter 的手势设计，并对于基础事件（Down/Up/Move/Hover）引入[[架构/GUI/Input|路由机制]]。
### Input Manager
#### 记录的状态
- Pointer Down 所 Hit 的控件，用于 Dispatch Pointer Up 事件
- 在 Dispatch Event 过程中，产生的手势
#### 与 Window Manager 的关系
window manager 持有
## Focus
Keyboard 事件经由 Focus 控件发送给 Element，通过回调将事件派送给 State。
