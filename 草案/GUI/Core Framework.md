---
create: 2023-10-26 16:09
aliases: []
tags: []
---
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