---
create: 2023-10-30 10:42
aliases: []
tags: []
---
## 分层模型
![[架构分层模型.png|800]]
- **Backend**：提供对系统的控制、查询功能，负责==对外==控制和信息提供
- **CoreFramework**：控件框架，提供必要的框架性功能，确定控件书写的基本逻辑
- **CoreSystem**：半外挂（外挂 framework）式系统，提供输入与窗口管理，通过插入对应的控件影响 Widget

## 重要系统从属 & 结构
```mermaid
%%{init: { "flowchart": {"useMaxWidth" : 1} } }%%
flowchart TD

NativeDevice["NativeDevice"]
BuildOwner["Build Owner"]
PipelineOwner["Pipeline Owner"]
OtherSystem["Other Systems..."]

Sandbox{"SandBox"}

NativeWindow1["NativeWindow"]
NativeWindow2["NativeWindow"]
NativeWindow3["NativeWindow"]

InputManager1["InputManager"]
InputManager2["InputManager"]
InputManager3["InputManager"]

NativeDevice-->Sandbox
BuildOwner-->Sandbox
PipelineOwner-->Sandbox
OtherSystem-->Sandbox

Sandbox-->NativeWindow1
Sandbox-->NativeWindow2
Sandbox-->NativeWindow3

NativeWindow1-->InputManager1
NativeWindow2-->InputManager2
NativeWindow3-->InputManager3
```

其中，sandbox 是一个外部概念，代表对基本系统的拼装，将 Input/WindowManager 功能，与 CoreFrameWork 相组合，形成最终工作的控件树。

