---
create: 2023-06-05 14:43
aliases: []
tags: []
---

## 🎯目标
OGUI 的定位是同时作为 Sakura Engine 的 ==Editor GUI== 框架和 Sakura Engine 的 ==InGame GUI== 框架，从 GUI 框架的要素来看，我将其分为已下几个维度：
- 排版 & 渲染 & 绑定
- 窗口 & 分辨率
- 输入 & 导航
- 本地化
- 控件编辑器体验

### 排版 & 渲染 & 绑定
从灵活性、完备性角度出发，提出以下要求：
- ==复杂文字排版和渲染==，支持可插入控件的富文本，支持复杂文字效果（下划线，描边，阴影等），支持文字动画，支持复杂的对齐方式与断行（双端对齐），支持复杂语言（阿拉伯语）以及 RTL 排版，支持 emoji，支持多种字体格式（FT，MSDF 等）以及多种渲染方式（图集，GPU SVG）
- ==基础的文本编辑==，支持基本的光标，框选，输入以及 IME
- ==动态的控件结构==，以适应 Game 中频繁的 Transform、Animation，以及频繁的控件树结构变化
- ==易用的动画==，支持帧动画，过度，自定义动画，材质动画，图元动画以及 Lottie，PAG 等第三方动画格式
- ==自由组装的布局系统==，在支持 Box 套 Box 的向下约束系统同时，还要支持子控件影响父控件的自适应系统
- ==控件 Effect==，支持自定义控件材质，自定义全屏后处理（磨砂），子树后处理（Opacity），甚至粒子效果
- ==数据绑定==，绑定数据与控件，精确触发局部的控件更新
- ==View 类型==，灵活的 View 类型，能够实现 ListView、GridView、GraphView 等功能
- ==解耦的渲染后端==，GUI 只负责提供初步拼接的三角与图层，渲染方式由持有控件的一方决定
- ==3D/WorldSpace UI==，同上

从性能角度出发，提出以下要求：
- ==局部刷新的控件树==，尽量控制刷新范围，尤其是在控件树高速变化的 Case 中
- ==精准的数据更新==，数据的更新尽量精确到具体控件，减少控件树 Rebuild
- ==View 子元素按需构建==，按需构建各种 View 的子元素，以减轻大数据集对性能的影响
### 窗口 & 分辨率
窗口类需求主要为了适配 Desktop Editor 的需求，作为现代游戏编辑器，必须具备以下功能：
- ==多窗口支持==，并适配多显示器与 Virtual Desktop
- ==Docking==，在多窗口支持的基础上，实现多窗口组合与布局能力
- ==DPI==，针对多显示器的 DPI 支持
- ==Native Popup==，Native Window 支持的 ToolTip、Menu、PopUp 服务
### 输入 & 导航
- ==焦点管理==，窗口级别的焦点管理与多窗口切换，以及控件树的焦点管理与输入路由
- ==跨设备输入==，键盘、鼠标、手柄、触摸板等输入
- ==导航==，主要提供给无鼠标或触摸板的平台，在控件树焦点管理之上实现控件导航
- ==HitTest & 输入路由==，支持多阶段的事件路由，以及自定义的 HitTest 逻辑
- ==Drag & Drop==，支持 Native 拖拽，支持内置拖拽
### 本地化
- ==本地化支持==，文本、样式、资产都需要可以本地化
### 控件编辑器体验
敬请期待

## 🚀计划 & 分析
由于系统太过庞大，无法进行完全的瀑布开发，因此，计划与 MileStone 同步进行。
### MS1. 架构试验
本阶段主要进行架构粗框的设计，在考虑到后续 Feature 的前提下，尽可能的进行合理的 API 设计，由于架构过于庞大，本阶段工作仅限于核心概念的设计与验证。
#### Feature
- 表层书写范式 [[Widget Build]]
- Widget/Element/RenderObject 三颗树的设计，其中 Widget 与 Element 层仅验证 RenderObject 相关部分，Stateless 与 Stateful 相关流程并不在此列
- Element 的 Build，RenderObject 的 Layout/Paint 流程，以及其附属 Scheduler，需要注意的是，此处流程中并不包含 Element 回收利用以及 Key 相关的逻辑
- Canvas/Text Backend 的基础设计
- Device Backend 的基础设计，初步考虑多窗口与单窗口的抽象，需要注意的是，本阶段并不包含 Focus 与 Input 的验证，之所以在这个阶段引入 Device Backend 相关的接口，是为了确定控件树的组织方式（主要是为了 Root 与后续的 Docking 功能）
- Layer 层的简单实现，不过在本阶段，整个控件树只会产生一个 Layer 层，这是因为复杂功能的验证本身需要输入系统的支持，这一系统将会在下一个阶段实现
### MS2. 架构验证
本阶段对之前的架构粗框进行完善，在这一阶段中，将初步实现 GUI 系统的全部要素，框架核心 API 在这个阶段将趋于稳定
#### Feature
- Input/Focus/Navigation 的基本实现，API 固化 80%
- NativeDevice/NativeWindow API 固定，并有完整的后端实现
- 实现 SingleWindow 和 MultiWindow 两种范式，并支撑起初步的坐标系统与 Docking 实现
- Stateless/Stateful 实现，Key 复用实现，子树迁移实现，整个 framework 实现层层递进的脏构建功能
- 初步动画实现，实现 Ticker 管理，并在此基础上验证脏更新的可靠性
- 复杂的 Layer 系统，与对应的后端实现，并实现基础的合批器
- Debug Service 的基本接入，支持 Runtime/Dev 的分离实现，在 Release mode 中，Dev 下的耗时验证可以被剔除
- 明确 Framework 中各种对象生命周期、调用流，并实现一份 Checklist，作为开发过程中的文档、规范、检查思路
- 明确控件的排版过程，对排版过程中的数学、逻辑、对象异常做充分的检查，尤其的排版过程中出现的 inf 和 nan 值
- 对于控件的排版、Framework 的生命周期等，制定初步的单元测试，来保证在大多数情况下框架的可靠性

## 🏗️MileStone
### MS1. 架构试验

- [x] Widget 书写范式
- [x] Widget 基本组件
	- [x] Canvas
	- [x] Positioned
	- [x] SizedBox
	- [x] Flex
	- [x] ColoredBox
	- [x] Text
	- [x] ColorPicker
	- [x] GridPaper
- [x] ICanvas & IParagraph 基本抽象
- [x] Element Mount 流程
- [x] RenderObject Paint 流程

## 📝记录
### 设计哲学
SkrGUI 遵循的设计哲学是：**从简单直白的概念出发，通过概念再拼装提供复杂功能。**

==平衡控件更新与表达直观性==：
- 简单设计：使用 Widget 进行表达，RenderObject 进行具体 UI 功能的承载，Element 作为中介控制 Widget -> RenderObject 的信息传输
- 复杂功能：通过 StatelessWidget/StatefulWidget 的拼装组成复杂的业务逻辑，比如一个 TextField，可能由以下组件构成
	- TextFieldState：存储控件状态
	- Focus：获取焦点
	- Text：内容
	- ColoredBox/ImageBox：输入框和光标

==解决控件之间的信息传输问题==：
- 简单设计：通过树形结构，将某一 Widget 节点作为作用域，将 Widget 的祖先控件作为通知对象，提供控件间信息传输与**控件封装**的更好选择。
- 复杂功能：通过 InheritedWidget/StatefulWidget 的嵌套组合，可以实现特定复杂功能控件的封装，其表现会依循父子关系的变化而变化

==焦点管理与导航==：
- 简单设计：提供 FocusNode/FocusScope 的基础封装由控件（或者用户传入的方法）控制焦点的迁移
- 复杂功能：控件本身提供一套默认的 Navigation 方法，而这个方法可以由用户覆盖