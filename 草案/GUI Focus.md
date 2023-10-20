---
create: 2023-10-20 15:08
aliases: []
tags: []
---
Focus 延续 Flutter 的设计，分离一个 FocusManager 进行 Focus/Navigaton 的管理，Focus 提供以下概念：
- `Focus/FocusNode`：一个可以被 Focus 的节点，通常一一对应到对应 `Focus` 控件
- `FocusScope/FocusScopeNode`：一种特殊的 FocusNode，用来限制其 child 的 navigation
- `FocusTraversalGroup/FocusTraversalPolicy`：控制 Focus 节点变化的控件，用于控制一定范围内的 Focus 如何转移
## Tips
- Focus 需要区分 KeyboardFocus 与通常的 Focus（疑似 FocusScope 局部焦点留存问题，待议）
- Focus 的迁移策略由 FocusTraversalGroup 决定，或者说如果有主动指定的目标，需要将数据存在 FocusTraversalGroup 内，不能存在本 FocusNode 内
- 控件负责识别输入，并把输入流送给 Focus 系统