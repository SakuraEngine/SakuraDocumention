## Event
输入事件需要进行一些整合（主要是对于移动端设备），比如多个触摸事件（Touch）可能整合为手势事件（Gesture）。这个整合的过程可以抽象为一层输入事件层，并且在框架内提供内置事件，而更原始的输入（RawInput）由宿主提供。
## Route
控件处理输入事件需要控制优先级和流程，比如表层的控件会优先处理事件，这个过程称为事件路由（Route），其发生在 RenderObject 层，参考 WPF 的事件路由，整体拆分为以下阶段：
* 选取（Picking），对于指针类事件（Mouse，Touch 等）通过射线检测按渲染层级选择最表层的对象（HitTest）；对于其余类事件（Keyboard，JoyStick 等）直接选取当前全局输入焦点对象（GlobalFocus）
* 隧道（Tunneling），从选中对象的根对象开始，向着选中对象依次派发事件，一般用于使指针点击/悬停状态不受子对象影响。
* 到达（Direct），向选中的对象派发事件。
* 广播（Broadcasting），深度优先的向当前对象的所有子对象派发事件。
* 冒泡（Bubbling），从选中对线开始，向着根对象依次派发事件，此时一般满足视觉上的层级顺序。
在任意阶段，接受派发的对象都可以选择中断路由。

对于更复杂的乱序需求，只能把事件拆为多份事件，并由对象重新派发事件来组织。乱序例子：
```
FocusScope
- ScrollList
-- Item
```
要求对于 KeyEvent 的响应顺序为 Item > Navigation > ScrollList，此时需要 PostNavigationKeyEvent 来实现需求。