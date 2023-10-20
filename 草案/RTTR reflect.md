---
create: 2023-10-20 16:20
aliases: []
tags: []
---

```cpp
sreflect_struct(
	"rttr": {
		"enable": true           // default: true   默认生成一个空壳对象
		"reflect_bases": true,   // default: true   是否反射继承关系
		"exclude_bases": [],     // default: empty  不参与反射的 base 项目
		"reflect_fields": true,  // default: false  默认 field 反射
		"reflect_methods": true, // default: false  默认 method 反射
	}
)
```
