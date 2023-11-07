---
create: 2023-11-07 16:35
aliases: []
tags: []
---
现在使用 `#ifdef.....#endif` 隔开的做法在代码层面造成了一定的混乱，提出以下方法优化并统一代码结构

c header:
```cpp
typedef struct skr_guid_t {
	uint32_t a;
	uint32_t b;
	uint32_t c;
	uint32_t d;
} skr_guid_t;
```

cpp header
```cpp
namespace skr {
	struct GUID {
		uint32_t a;
		uint32_t b;
		uint32_t c;
		uint32_t d;
	};
}

using skr_guid_t = skr::GUID;
```