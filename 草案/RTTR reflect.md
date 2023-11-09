---
create: 2023-10-20 16:20
aliases: []
tags: []
---

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
