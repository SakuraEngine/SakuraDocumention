---
create: 2023-04-23 21:40
aliases: []
tags: [ECS, Resource]
---
## Resource Field
ResourceHandle 是基于 RAII 运作的，ECS 默认不开启 RAII，所以直接在组件中使用 ResourceHandle 是 UB 行为，现在 ECS 中提供两种方式处理 ResourceHandle：

1. 在注册 Component 的时候注册所有 ResourceField，则 ECS 会在运行时动态的处理 ResourceHandle 的生命周期
2. 使用生命周期回调，手动启用 RAII

对于这两种方式我们都提供了快捷方式：

1. component codegen 会自动扫描所有的 resource field 并注册，但是需要注意的是，**成员或者成员的类型没有反射则不会被扫描到**
2. 使用 component codegen 的 custom 参数可以提供一个函数用于修改生成的 component desc，我们提供一个函数 `dual::managed_component` ，这个函数会注册所有的生命周期函数
```cpp
sreflecte_struct("guid" : "E3EAA725-DADF-458B-9CB0-AE1D338A2CF4")
sattr("component" : true)
test_comp_t
{
    SKR_RESOURCE_FIELD(skr_mesh_resource_t, a); // typed
    skr_resource_handle_t b;
};

sreflecte_struct("guid" : "AF0E0201-A177-47FF-84E0-77FC6ED8093C")
sattr("component" :
{
    "custom" : "::dual::managed_component"
}) 
test_comp2_t
{
    SKR_RESOURCE_FIELD(skr_mesh_resource_t, a); // typed
    skr_resource_handle_t b;
};

```
