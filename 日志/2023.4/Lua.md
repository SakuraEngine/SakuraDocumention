---
create: 2023-04-23 21:40
aliases: []
tags: [ECS, Script]
---
## 目标
接入 lua 的目标主要是作为一个开箱即用的表达式引擎和调试工具的前端，比如
* 编辑器命令行
* 调试面板的 UI
* 快速批量处理对象数据的脚本
在这些轻量级的使用场景有一个开箱即用（无需编译，嵌入式的）语言会是很大的助力。
## 值与类与函数
现在引擎里有基础的 Lua 绑定可以用了，基本支持了全套的自动对象绑定
* 基本类型的绑定
* 字符串的绑定
* 对象的绑定
	* 共享指针
	* 值语义
	* 裸指针
* 函数的绑定，包括多返回值的支持
* C 风格函数指针，C++风格函数制作等
下面是一个示例：
```c++
sreflect_enum("guid" : "b4b7f387-d8c2-465c-9b3a-6d83a3d198b1")
sattr("serialize" : ["json", "bin"])
sattr("rtti" : true)
sattr("scriptable" : true)
ECGPUBackEnd SKRENUM(uint32_t){ 
    Vulkan, 
    DX12, 
    Metal
};
typedef enum ECGPUBackEnd ECGPUBackEnd;

sreflect_struct("guid" : "b537f7b1-6d2d-44f6-b313-bcb559d3f490")
sattr("scriptable" : true)
config_backend_t
{
    ECGPUBackEnd backend;
    ECGPUBackEnd GetBackend() const { return backend; }
    void SetBackend(ECGPUBackEnd inBackend) { backend = inBackend; }
    void GetBackend2(sattr("out" : true) ECGPUBackEnd& outBackend) const { outBackend = backend; }
    void GetSetBackend(sattr("inout" : true) ECGPUBackEnd& outBackend) { ECGPUBackEnd old = backend; backend = outBackend; outBackend = old; }
    void CopyBackend(const config_backend_t& other) { backend = other.backend; }
    void SetBackendCallback(void (*callback)(sattr("userdata" : true) void* userdata, sattr("out" : true) ECGPUBackEnd&), void* userdata) { callback(userdata, backend); }
    void GetBackendCallback(skr::function_ref<void(ECGPUBackEnd)> callback) const { callback(backend); }

    sattr("native" : true)
    void* dirtyStuff() { return this; }
}
```
## Imgui
通过解析 cimgui 输出的元信息生成了一套 cimgui 的 lua 绑定，目前处于不稳定状态（主要是由于 cimgui 的不稳定）
imgui 只是过度的临时方案，以后会替换为 ogui
## ECS
在 ECS 层面也提供了一套手工设计的足够简单的 lua api，主要包含如下几个函数：
* `create_query` 和 C++ 一致的创建查询
* `iterate_query` 遍历一个查询，需要传入一个回调，回调有一个参数 `view`
	* 通过调用 `view(i)` 获取第 i 个对象的组件序列，序列由查询决定 
	* 通过调用 `view.with(entity)` 进行递归的遍历
下面是一段示例代码，代码的作用是用 Imgui 展示场景的层级结构
```lua
local imgui = require "imgui"
function module:init()
    self.animQuery = skr.create_query(game.GetStorage(), "[in]game::anim_state_t")
    -- root entities
    self.outlineQuery = skr.create_query(game.GetStorage(), "[in]?skr_name_comp_t, [in]?skr_child_comp_t, [has]!skr_parent_comp_t")
end

function module:DrawEntity(entity, name, children, view)
    if name == nil then
        name = "entity" .. tostring(entity)
    end
    local flag = imgui.TreeNodeFlags_OpenOnArrow
    if children == nil then
        flag = flag + imgui.TreeNodeFlags_Leaf + imgui.TreeNodeFlags_NoTreePushOnOpen
    end
    imgui.PushIDInt(entity)
    local opened = imgui.TreeNodeEx(name, flag)
    imgui.PopID()
    
    if opened and children~=nil then
        local childrenTable = newtable(children.length, 0)
        for i = 0, children.length - 1 do
            table.insert(childrenTable, children(i))
        end
        view:with(childrenTable, function(cview)
            for i = 0, cview.length - 1 do
                local centity, cname, cchildren = cview(i);
                self:DrawEntity(centity, cname, cchildren, cview)
            end
        end)
        imgui.TreePop()
    end
end

function module:DrawHireachy()
    skr.iterate_query(self.outlineQuery, function(view)
        for i = 0, view.length - 1 do
            local ent, name, children = view(i)
            self:DrawEntity(ent, name, children, view)
        end
    end)
end
```
## HotReload
接入了云风的 [如何让 lua 做尽量正确的热更新]([云风的 BLOG: 如何让 lua 做尽量正确的热更新 (codingnow.com)](https://blog.codingnow.com/2016/11/lua_update.html)) 
## Luau
后续会将 lua 替换为 [luau]([Luau - Luau (luau-lang.org)](https://luau-lang.org/)) ，后者提供了更高的性能和可选的静态类型系统，同时保留了 lua 的语法风格和灵活性。

