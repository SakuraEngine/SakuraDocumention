---
create: 2023-10-26 16:09
aliases: []
tags: []
---
## 选型思考
UI 程序关注于**数据的呈现与更新**，我们将其拆解为**呈现**，与**更新**，分而食之
### 呈现-如何描述一个 UI 界面
#### 面向对象-代码驱动
通过拼装控件树来描述界面，逻辑与界面元素能够有良好的联动，但是**代码繁琐**，**状态琐碎难以维护**。典型的例子是 QtWidget。这种类型 UI 的最大问题在于：==UI 自身带有状态且较为琐碎==，这导致了==状态维护（数据绑定）的复杂且难以维护==。
```typescript
let click_count = 0
let state_text = new Text(`Click Count: ${click_count}`)
let ui = new VerticalBox({
	children: [
		state_text,
		new Button({
			content: new Text("Click Me"),
			on_click: { 
				++click_count
				state_test.text = `Click Count: ${click_count}`
			}
		})
	]
})
```

#### 标记语言-声明式
通过标记语言声明控件，通过解析页面文件生成控件树，这形成了非常明确的**职责分割**，并便于框架进行数据绑定，页面文件可以被视为一个**无状态 UI**，因为具体的控件树向用户隐藏，这类 UI 的最大问题是：声明式标记较为死板==无法描述变动频繁的复杂界面==，完成如响应式布局的功能，==性能较差==，因为多了一层文档解析和对象创建
```xml
<VerticalBox>
	<Text>Click Count: {binding.click_count}</Text>
	<Button on_click="binding.on_click()">
		<Text>Click Me<\Text>
	</Button>
</VerticalBox>
```

#### ImGUI-代码驱动
通过代码调用立即生成界面，这使得**代码极为简单**，并且**完全不需要数据绑定**，由于界面完全由代码驱动，所以**UI 无状态**，但是这也带来了复杂排版的局限性，这类 UI 最大的问题是：==性能较差==，且==难以实现动画和排版==（这是由无状态带来的问题）
```typescript
let click_count = 0
begin_vertical()
text(`Click Count: ${click_count}`)
if (button(`Click Me`))
{
	++click_count
}
end_vertical()
```

#### 我们需要什么
观察上述 UI，不难发现，主要问题集中在：
- UI 携带的状态难以维护
- 代码驱动难以直观表达界面
- 标记式的语法无法表达变动频繁的复杂界面

我们希望：
- UI 描述看起来尽量是**无状态的**
- 尽量保持**单向数据流**，即只「从数据建立 UI」而不「让 UI 读取数据或让数据更新 UI」

结合以上几点的优劣，我们可以开发出这样一种模式：
- 创建一个轻量的对象树描述结构，这个结构不做状态留存（相当于实现了轻量的标记式语言），==描述性强，便于阅读和拆分职责==
- 由框架将轻量对象树转化为实际的渲染对象树，并维护数据更新（相当于维护了数据绑定），==集中化数据更新，便于维护==
- 由于这个轻量表层不留存状态，可以频繁的更新（相当于实现了 ImGUI 的局部重建），这样就可以==自由的更改界面组成==

```typescript
let ui = new StatefulWidget({
	state: new ClickState({click_count: 0}),
	build: (state) => {
		return VerticalBox({
			children: [
				new Text(`Click Count ${state.click_count}`),
				new Button({
					content: new Text("Click Me"),
					on_click: () => {
						++state.click_count
						state.dirty()
					 }
				})
			]
		})
	}
})
```

^dhpuz3

但是，这种模式依旧引入了以下限制：
- 为了实现无状态的 UI 表层，牺牲了**精确更新**的能力，因此，需要手动调整更新粒度来保证性能
- 在动画等情形中，由于**频繁的创建对象**，需要手动优化来保证性能
- 手动控制的 State 状态，需要注意以防止引发 Bug

### 更新-状态管理

> 可变的与不可预测的状态是软件开发中的万恶之源

UI 架构的核心就是「界面<->数据」之间的绑定与状态管理，对一个架构来说，需要尽量满足以下几点：
- **合理的职责划分**，方便分工协作（逻辑-界面），防止「界面<->数据」之间的反复相互调用（相互持有），且需求变动波及的代码尽量少而准确
- **易用性**，简洁的架构，易于理解的表层 API，尽量高的（控件）代码复用
- **稳定的数据绑定**，当数据发生变化时，准确的完成界面更新
- **良好的性能**，尽量节约 UI 系统的 CPU 与内存占用
#### MVC-巨大化控制器
通过 Controller 调度界面与数据，将复杂的业务逻辑集中在 Controller 中，通常与 [[#面向对象-代码驱动]] 的呈现方式联用，其问题在于
- Controller 在修改 Model 的同时要兼顾通知 View，导致 Controller 的逻辑和依赖巨大化，耦合加重 
- View 需要了解 Controller，需要在用户输入时通知 Controller
- View 需要了解 Model，并在接收到 Controller 通知后从 Model 抽取数据

这导致了==调用流错综迂回==，模块之间耦合较重，且==未能完成 View-Model 之间的解耦==

![[Pasted image 20231113195849.png|600]]

一种优化方式是将通知下放到 Model 层，通过==加重 View-Model 耦合==的代价，简化 Controller 代码
![[Pasted image 20231113195922.png|600]]
#### MVP-中间人
通过 Presenter 层==彻底隔离 Model 和 View==，Model 持有 Presenter 作为中间人与 View 进行沟通，其呈现方式通常是 [[#面向对象-代码驱动]]，其问题在于：
- 数据流 Model->Presenter->View 经历了过多的环节，==引入了过多的样板代码和危险因素== 
![[Pasted image 20231113221558.png|600]]

为了简化数据流，可以在 View-Model 中开辟一条功能纯粹的数据绑定通道，而不是从 Presenter 添加样板代码传递数据
![[Pasted image 20231113221618.png|600]]
#### MVVM/MVB-无状态 View 与自动化绑定
通过 [[#标记语言-声明式]] 的呈现方式，构建一个相对独立的 View 模块，与外界只通过声明的数据结构交互，并且知道数据结构改变时该如何渲染自身。因此，ViewModel 只需要**提供数据**和**接收事件**，并和 Model 交互，提取 View 需要的数据即可，它==完全解耦了 View-Model==，并提供了==业务拆分==的能力，让开发者分为界面和逻辑两块，但是存在以下问题：
- 为了实现 View 的完全无状态，降低了 View 层的性能，同时==限制了灵活布局的可能性==
- 复杂的 ViewModel 绑定层抽象，以及为了实现无状态 View 添加的绑定语言机制，==带来了较大的学习成本==，并且==不便于 Debug==
- 为了实现 Model->ViewModel->View 的冗长路径，会==引入大量胶水代码==

![[Pasted image 20231113222723.png|600]]
#### MVU-单向数据流
通过类似 [[#ImGUI-代码驱动]] 的方式，直接将数据映射为 UI，带来==最大的灵活性==，同时==最大化降低了状态维护的心智负担==，为了解决性能问题，使用了一个 [[Core Framework#^dhpuz3|轻量表层]]，并且通过对 Model 进行分层，来划分更新粒度，并由 View 自身解决界面变动的优化问题，这样，数据流和控制流就由一个==单向循环==完成，每个模块都得以保持==最少知识原则==，这也带来了==优良的职责分离==，这也引来以下的问题：
- 由于使用了立即式映射的方式构建 UI，需要==依靠粒度拆分缓解更新成本==
- Model 需要提供脏标记，这==引入了一定的设计约束==，使用这套架构可能需要对原始架构完成一定的微调
![[Pasted image 20231113225513.png|600]]

#### 选型
我们需要什么：
- ==非常灵活的界面构成==，来组成高度动态和结构高度可变的界面
- ==良好的性能==，需要尽量降低框架带来的性能限制，尽量提供性能的优化空间
- ==较低的维护负担与门槛==，用以支撑**快速迭代**以及人员多样性带来的**上手成本**
- ==良好的职责分离==，实现良好的**团队分工**

我们能接受什么：
- ==一定的设计约束==，一是处于早期阶段，二是以快速迭代为主，三是架构本身灵活性较强，可以接受架构的微调
- ==一定的短期性能问题==，由于使用 C++ 开发，性能问题在短期内可以得到较好的缓解，只需要留出优化空间即可

因此，MVU 相对于 MVVM 更加适合
### Clean Architecture
![[Pasted image 20231113231927.png|600]]
Uncle Bob 提出 Clean Architecture 认为，依赖洋葱图中的任一内层模块不应该了解或依赖于任何外层模块，这些模块之间尽量通过接口/抽象类进行连接，这也是 SkrGUI 在开发中遵循的点

## MVU 架构设计
- Element/RenderObject 生命周期
- Element（State）间的依赖管理
- Stateless/Stateful Widget 限制更新作用域的原则（主要由于 StatefulWidget 提供，StatelessWidget 一般只提供组合控件）

## 输入与工作环境
- 输入通过 InputContext/RenderInputContext 介入控件树，由一个外部的 InputManger 进行管理
	- HitTest/EventDispatch
- 工作环境通过 NativeWindow 介入控件树，由一个外部的 WindowManager 进行管理
	- 渲染所需的素材，如 Font/Canvas 均由 NativeWindow 进行提供
	- 渲染所需的 Image 等素材，就可以由用户层封装自由发挥，最终体现在 Canvas 内即可
	- 坐标系统 & DPI

## Element 更新触发与时序
### 重载的函数
- `first_mount`：第一次挂载
- `update`：widget 发生变化，但是类型和 key 没变
- `perform_rebuild`：由 build_owner 发起，因为有时其逻辑与 update 高度重叠，所以也会在 update 中主动调用
### First Mount
- `_inflate_widget`
- `mount`
- `first_mount`
### Update
- 由 BuildOwner 发起
- `rebuild`
- `_update_child/_update_children`
- `_update_slot_for_child/child->update/_inflate_widget`

## 坐标系统
以 NativeWindow 为界，在 NativeWindow 内，所有的坐标工作于 logic pixel 下，在 Native 外，会进入系统定义的 Virtual Desktop 坐标系统中

system/global/local 语义：
- system 指工作在系统 VirtualDesktop 下的==系统坐标==，通常是==物理像素单位==的
- global/local 指相对于目标控件左上角的==逻辑坐标==

### 控件的坐标转换
