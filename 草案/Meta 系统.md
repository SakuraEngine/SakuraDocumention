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
### 简写
为了简化书写，方便配置，可以提供一些简写方式：
- 开关简写：映射到 enable 词条
```cpp
"rttr": true
```
- 其它简写：通过 parser 自由定义
```cpp
"rttr": "full"
"rttr": ["field", "method", "no-bases"]
```
### 路径折叠
为了折叠路径，可以使用 `::` 来指定路径
```cpp
"rttr::reflect_bases": false
```
### 覆写
通常来说，不允许==叶子词条==重复出现，如果需要对先前词条进行改动，需要在词条尾部添加 `!` 或 `!!` 来进行覆写，其中，`!` 代表部分覆写，`!!` 代表完全重写，部分覆写代表只覆写给出的条目，完全重写则会将先前已经赋过的值完全重置，==覆写只对叶子词条生效（包括 List）==

非叶子词条可以重复出现，只要他们最终在叶子词条部分不出现冲突：
```cpp
"test": {
	"A": 100
}
"test": {
	"B": 200
}
```

某些情况下，我们期望的叶子词条会是一个没有预定义结构的字典，由于覆写检查会在预处理阶段进行，这个字典也会按照预处理的规则拼接：
```cpp
"meta": {
	"editor_readonly": true
}
"meta": {
	"display_type": "table"
}
```

对各种简写情况下的行为，我们做出如下定义：
- 简写覆写：将对应条目完全映射并覆写
```cpp
"rttr!": ["field", "method"]
"rttr!": false
```
- 路径覆写：将对应条目完全映射并覆写
```cpp
"rttr::reflect_bases!": false // 展开为下面的形态
"rttr": {
	"reflect_bases!": false
}

"rttr!::reflect_bases": false // 展开为下面形态
"rttr!": {
	"reflect_bases": false
}

"rttr!!::reflect_bases": false // 展开为下面形态，需要注意的是，rttr 下的其余词条均被抹除，强制重写从 rttr 开始
"rttr!!" {
	"reflect_base": false
}
```
- 完整的 functional 覆写：从标记覆写开始的所有子对象均视为覆写
```cpp
"rttr!": {
	"reflect_fields": true,
	"reflect_methods": true,
}
"func": {
	"sub_func!" : { // 从这里开始，所有叶子节点的变量都会被覆写
		"A": 1,
		"B": 2,
		"func!!": { // 从这里开始，变成了强制覆盖
			"C": 3,
			"func!": { // 从这里开始，又变成了覆写
				"D":, 
			}
		}
	}
}
```

### 合并
除了覆写需求，有时候还需要对某个词条的值进行合并（通常用于 List），合并词条以 `+` 结尾，规则如下：
- 无论如何，以 `+` 结尾都会导致结果为 List，如果需要字典合并，应当使用覆写规则
```cpp
"test": 10
"test+": "shit"
// 最终合成
"test": [10, "shit"]

"test+": [10, 114.514]
"test+": "shit"
// 最终合成
"test": [10, 114.514, "shit]

"test+": "fuck"
// 最终合成
"test": ["fuck"]

"test": { "fuck": true }
"test+": 100
// 最终合成
"test": [ {"fuck": true}, 100 ]
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