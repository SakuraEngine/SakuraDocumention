---
create: 2023-11-07 17:45
aliases: []
tags: []
---
为了简化 attribute 的书写是否可以提供预设的 Attribute Group，通过如下方式使用：
```cpp
sattr("groups": ["serde-all", "rttr-minimal"])
```

Group 信息通过如下方式提供：
1. 在外部或者 Generator 中指定，其好处是不需要重复书写，适合约定俗成的一些规则
2. 通过父级 Scope 指定，其好处是完全位于代码中，阅读上下文连贯，适合局部简化代码

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