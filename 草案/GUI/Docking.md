---
create: 2023-10-25 16:45
aliases: []
tags: []
---
## 类型结构
```mermaid
%%{init: { "flowchart": {"useMaxWidth" : 1} } }%%
classDiagram
dir

DockingNode<|--DockingSplitter
DockingNode<|--DockingTabStack
DockingSplitter<|--DockingArea

class DockingNode
class DockingSplitter
class DockingTabStack
class DockingArea
```
