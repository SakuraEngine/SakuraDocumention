---
create: 2023-10-20 14:53
aliases: []
tags: []
---
## 输入方式与操作习惯
在 Desktop 平台，我们通过鼠标/触摸板，以及物理按键和触摸板内置的手势，进行==精确式==的操作，操作的对象往往==直接指向==控件树中的某一个控件，也不会用指针做出**复杂的手势**。

而在移动平台，我们通过触控屏/触摸笔，直接操作 UI 平面，相比于 Desktop 少了许多**输入维度**，为了弥补这一维度


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
延续并扩展 Flutter 的手势设计，并对于基础事件（Down/Up/Move/Hover）引入[[Input 1|路由机制]]。
### Input Manager
#### 记录的状态
- Pointer Down 所 Hit 的控件，用于 Dispatch Pointer Up 事件
- 在 Dispatch Event 过程中，产生的手势
- PointerTracker 追踪光标的移动状态
#### 与 Window Manager 的关系
input manager 可能是针对某个具体 Native Window 的，原因如下：
- UI 系统需要记录当前活跃的窗口以派发 KeyEvent
- Input 事件的 Dispatch 通常是以 native window 为单位的（无法再向上兼并了，因为一个 NativeWindow 管理着一颗控件树）

所以，让 Input Manager 以窗口为单位存在是一个合理的设计。

而这个设计带来的问题是，跨窗口动作（手势），比如 DragDrop，需要跨越多个 Input Manager 来完成交流，以 DragDrop 为例：
- Begin，存储在发出窗口的 InputSystem 中
- Move，在拖动过程中
	- 通过 Window Manager 调用 InputTest
	- 对 DropTarget Dispatch Event
- End，同 Move

## Focus
Keyboard 事件经由 Focus 控件发送给 Element，通过回调将事件派送给 State。
#### 与 Window Manager 的关系
focus manager 同样也是针对某个 Native Window 的，原因如下:
- UI 系统需要记录当前活跃的窗口以派发 KeyEvent
- 当前窗口无需关注其它窗口的 Focus，Focus 的概念具有强烈的 Scope 内聚性

因此，Focus Manager 也理应以窗口为单位。

## FUCK U INPUT CONTEXT
BuildOwner 在本框架中，被设计为了管理整个框架的核心，其有义务记录控件树树根——NativeWindow，而 NativeWindow 则相当于一个 InputContext 区域，上文所述的需要存储在 InputContext 中的状态，实际上更适合以全局的方式进行存储，因此，有一个 InputManager 或者 BuildOwner 其实就已经足够。

## 手势竞争
为每个触点/按钮建立一个竞技场，在竞技场中胜出的一方会真正的处理事件，每次只有一个手势可以胜出，当一个手势需要拥有多个 pointer 时，通常会在这多个 pointer 的竞技场中都胜出。

desktop 的手势由 pointer & button 复合而成，因为通常我们不会使用多个鼠标物理按键协同操作，因此不同的 button 可以被视为不同种类的 pointer，接受各自的竞争

输入响应（手势操作）方面，我们以==单点触控==作为核心 Feature，为 Desktop 提供的手势通常只能在 Desktop 平台使用，而为 Touch 提供的手势（通常为单点触控），则可以接受 Desktop 的消息来模拟一些操作。

界面对不同平台输入的兼容性，通常体现在控件的实现（以及对手势的拼装），而不是在手势这一层完成的，在手势这一层进行这种工作会降低对各个平台的兼容性。

==？==：既然如此，那么是否不应该提供类似 Flutter 的 GestureDetector 的控件，而要求每一个受控的控件都自主维护一个 Gesture 呢，因为提供一个巨大的 GestureDetector 控件意味着提供一个体量非常大的控件结构，并且这样的通用性封装会增加控件树深度，其提供的通用逻辑本身也没那么实用

==FUCK==：杜绝 Flutter 的傻逼通用封装行为，GestureRecognizer 的生命周期是由业务需求决定的，比方说我写一个简单的 Button，只需要监听 Click 行为，Recognizer 的生命周期就跟着 State 走，如果我需要写一个浏览器底部栏的功能性 Button，那么我的 Recognizer 就跟着 Widget 一起走，毕竟我的行为可能要发生改变，但是频率也不大，弄一个超大 GestureDetector 去装所有的回调，==纯属傻逼行为==，况且 GestureRecognizer 本身也是轻量对象，对频繁刷新不敏感，压根不需要一个 Factory 来隔离重复创建，反而是 Function 不可 Copy 的性质非常傻逼（虽然这是 C++ 的锅），如果使用 Factory 的话，代码就压根没法写了

==路由==：手势识别器的职责是识别手势，有时候会需要一些控件接收不到的事件（比如脱离控件的 Route 事件），同时，有一部分事件需要来自控件的验证，并且在整个过程中最好不要进行任何事件的缓存，因此，我们选择的是，首先 Down/Up/Hover 等事件对控件进行派送，控件调用手势 `HandleEventFromWidget`，在这个函数中，手势记录下需要关注的信息，随后对手势进行事件派送，调用 `HandleEvent`，此时，手势根据之前记录的信息进行二次校验，真正的处理信息

==失败因素==：不同手势有不同的失败因素，一般来说，对于 desktop，有如下失败因素
- 对 Click 来说，Down/Up 不一致
- Double Click 间隔事件过长

然而对 touch 平台来说，失败因素相对比较复杂
- 对 Tap 来说
	- 触点移动距离过长
	- 超时
- 对 Double Tap 拉斯
	- 间隔事件过长
	- 任意一次 Tap 失败

同时，touch 平台的多触点也会引入==额外的复杂度==，这对于手势的抽象是一种考验，需要提前进行需求分析，确保抽象的正交性