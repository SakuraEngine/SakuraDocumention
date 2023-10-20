---
create: 2023-04-23 21:40
aliases: []
tags: [ECS]
---
# 问题描述
需要提供相对稳定的 ABI，并支持绑定到脚本。
# 方案解析
## 沙漏型设计
采用沙漏型设计，把 API 架设在 plain C 上面。
![[image.png]]
具体做法为：

- 普通结构体可以直接定义出来。
- 所有接口使用 C 函数申明：
   - 结构体参数和返回值使用指针
   - 对象使用前置申明指针
   - 返回数组使用函数指针（回调）
   - 在实现的时候可以转发到具体对象的成员函数
- 公开对象使用前置申明

举例来说：
abi 层：
```cpp
//dual.h
#define DUAL_DECLARE(name) typedef struct dual_##name dual_##name
DUAL_DECLARE(storage_t);

/**
 * @brief allocate entities
 * batch allocate numbers of entities with entity type
 * @param storage 
 * @param type 
 * @param count 
 * @param callback optional callback after allocating chunk view
 */
DUAL_API void dualS_allocate_type(dual_storage_t* storage, const dual_entity_type_t* type, EIndex count, dual_view_callback_t callback);
```
实现层：
```cpp
//storage.hpp
extern "C" struct dual_storage_t
{
    using query_cache_t = dual::query_cache_t;
    using archetype_t = dual::archetype_t;
    using serializer_t = dual::serializer_t;
    void allocate(dual_group_t* group, EIndex count, dual_view_callback_t callback);
    //...
};
//storage.cpp
void dual_storage_t::allocate(dual_group_t* group, EIndex count, dual_view_callback_t callback)
{
    //...
}

extern "C"
{
    void dualS_allocate_type(dual_storage_t *storage, const dual_entity_type_t *type, EIndex count, dual_view_callback_t callback)
    {
        storage->allocate(storage->get_group(*type), count, callback);
    }
}
```
封装层：
```cpp
//dual.hpp
namespace dual
{
	template<class T>
    T* get_component_ro(dual_chunk_view_t* view)
    {
        return (T*)dualV_get_component_ro(view, dual_id_of<T>::get());
    }
    template<class... T>
	struct entity_spawner_T
	{
	    type_builder_t builder;
	    dual_entity_type_t type;
	    entity_spawner_T()
	    {
	        type.type = builder.with<T...>().build();
	    }
	    struct View
	    {
	        dual_chunk_view_t* view;
	        std::tuple<T*...> components;
	        std::tuple<T*...> unpack() { return components; }
	        uint32_t count() const { return view->count; }
	    };
	    template<class F>
	    void operator()(dual_storage_t* storage, uint32_t count, F&& f)
	    {
	        auto trampoline = +[](void* u, dual_chunk_view_t* v)
	        {
	            auto& f = *(F*)u;
	            View view = {v, std::make_tuple(((T*)dualV_get_owned_ro(v, dual_id_of<T>::get()))...)};
	            f(view);
	        };
	        dualS_allocate_type(storage, &type, count, trampoline, &f);
	    }
	};
}
```
## C++ API
采用 DSL 和 codegen 减少 query 构建的复杂度。[[ECS QoL]]

- Filter
   - All/None
   - Overload
   - Owned / Shared
- Parameter
   - Read Write
   - Optional
   - Component Array
   - Component
   - Array Size
- Resource
   - Initialize
- Matched
   - Size
   - Mask
- Entities
- Index in Task
- Ownership Check
