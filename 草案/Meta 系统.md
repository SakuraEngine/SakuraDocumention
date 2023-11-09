---
create: 2023-11-09 23:38
aliases: []
tags: []
---
## 构建
```lua
shared_module("Meta", "META", engine_version)
	add_generator("serde", {
		files = { 
			"codegen/serde.hpp.mako", 
			"codgen/serde.cpp.make", 
			"codegen/serde.py" 
		},
		public = true
	})
```

在 target 下添加 generator 信息，并通过 module 依赖来传播

## 生成框架
### 流程
- LoadJson：从 json 文件加载数据，并对 Record/Enum/Field/Method 进行初步的解析
- CheckSchema：解析 attrs 并检查是否有误用/未识别，同时完成针对特定 Generator 的数据解析与检查
	- 未识别的情况通过跑完所有 Generator 的 Check 阶段后，对没有标记的 Field 做检查，这是为了防止一些拓展系统与原系统公用一名的情况
	- 简写识别同上，通过标记来解决问题
- Codegen：生成代码

### 生成框架
- 提供一个 Parser 封装，方便进行 Parse
- 提供基础 cpp 类型，与 Generator 的基础封装

## meta 标记设计规范
### 基本结构
通常来说，一个 meta 功能使用一个 json object 来标记，规则如下：
- `enable` 字段代表是否启用该功能，子功能遵循同样的守则
- 其余字段代表对该功能的配置
==后续一切都简化路径，都是在对这个结构作修改==
```cpp
"rttr": {
	"enable": true,
	"reflect_bases": true,
	"exclude_bases": [],
	"reflect_fields": true,
	"reflect_methods": true,
}

```
### 数组式简写
为了简化书写，方便配置，可以提供数组式的简写
```cpp
"rttr": ["field", "method", "no-bases"]
```
### 开关简写
为了方便对某个功能的开关，可以提供 bool 简写
```cpp
"rttr": true
```
### 路径简写
为了折叠路径，可以使用 `::` 来指定路径
```cpp
"rttr::reflect_bases": false
```
### 覆写条目
字段值覆写行为必须显式指定，指定方式是在条目尾部添加 `!`，如果不添加该修饰符，并覆写了字段，会引发报错
```cpp
"rttr!": false
```
## AttributeGroup
为了简化 attribute 的书写可以提供预设的 Attribute Group，通过如下方式使用：
```cpp
sattr("groups": ["serde-all", "rttr-minimal"])
```

Group 信息通过如下方式提供：
1. 在外部或者 Generator 中指定，其好处是不需要重复书写，适合约定俗成的一些规则
2. 通过父级 Scope 指定，其好处是完全位于代码中，阅读上下文连贯，适合局部简化代码
3. 通过 XMake 为每个模块预定义，好处是实现起来比较简单，且粒度也比较可控
4. 通过**传统手艺**宏定义，好处是非常的顶真

```cpp
namespace skr sreflect sattr("group-def": {
	"rttr-full": {
		"rttr": { 
			"enable": true, 
			"reflect_bases": true, 
			"reflect_fields": true,
			"reflect_methdos": true,
		 }
	},
	"rttr-minimal" : {
		"rttr": {
			"enable": true,
			"reflect_bases": false
		}
	}
})
{
	sreflect_struct(
		"groups": ["rttr-full"],
		"group-def": {
			"rttr-disable": {
				"rttr": { "enable": false }
			}
		}
	)
	Fuck {
		int a;
		
		sattr("groups": ["rttr-disable"])
		Shit* b;
	};
}
```

## 既有功能
### RTTR
```cpp
// for struct
sreflect_struct("rttr": false)  // 简写，免写 rttr 词条，只要提供了 guid 就自动开启，简写提供关闭功能的途径
sreflect_struct(
	"rttr": {
		"enable": true,          // default: true   是否启用 rttr 功能，冗余设计是为了方便临时开关
		"reflect_bases": true,   // default: true   是否反射继承关系
		"exclude_bases": [],     // default: empty  不参与反射的 base 项目
		"reflect_fields": true,  // default: false  默认 field 反射
		"reflect_methods": true, // default: false  默认 method 反射
	}
)

// for field/method
sattr("rttr": true) // 简写
sattr("rttr": { 
		"enable": true, // 控制单个 field/method 是否反射
		// ... other fields
   }
)
```