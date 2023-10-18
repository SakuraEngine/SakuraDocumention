构建控件树的语法需要满足：
1. 树结构的代码以直观的表现控件的嵌套结构
2. 具名参数以简化控件普遍存在大量参数的情况
3. 内嵌一定逻辑以按状态动态的创建子树
额外的加分项：
1. 对排版引擎（clang-format 等）友好，可阅读性高
2. 性能代价小
3. 代码噪音小
4. 调试友好
### 方案 1：Builder
Unreal Engine 的 Slate 框架采用的是 Builder 模式：串联返回自身的 build 方法来初始化参数。典型的代码如下
```cpp
SNew(SBorder)
	.Padding(InArgs._ThumbnailPadding)
	.VAlign(VAlign_Bottom)
	.HAlign(HAlign_Right)
	.Padding(FMargin(3.0f, 3.0f))
	[
		SNew(STextBlock)
		.Font( DEFAULT_FONT("Regular", 8) )
		.AutoWrapText(false)
		.LineBreakPolicy(FBreakIterator::CreateWordBreakIterator())
		.Text(InArgs._DisplayName)
		.ColorAndOpacity( FAppStyle::Get().GetSlateColor("Colors.Foreground") )
	]
```
其优缺点分析如下：
1. 优点：树状的嵌套结构
2. 优点：支持具名参数
3. 缺点：在创建子树的时候难以嵌入逻辑
4. 缺点：排版引擎不友好
5. 缺点：定义 Builder 需要大量宏，变量名和方法名冲突，引入下划线，代码噪音大
6. 缺点：调试不友好，难以断点
### 方案 2：Designated initializers
使用 C++20 的具名初始化列表来构建参数结构，典型的代码如下
```cpp
SNew(SBorder) 
{
	.Padding = InArgs.ThumbnailPadding,
	.VAlign = VAlign_Bottom,
	.HAlign = HAlign_Right,
	.Padding = FMargin(3.0f, 3.0f),
	.Child = SNew(STextBlock)
	{
		.Font = DEFAULT_FONT("Regular", 8),
		.AutoWrapText = false,
		.LineBreakPolicy = FBreakIterator::CreateWordBreakIterator(),
		.Text = InArgs.DisplayName,
		.ColorAndOpacity = FAppStyle::Get().GetSlateColor("Colors.Foreground")
	}
}
```
其优缺点分析如下：
1. 优点：树状的嵌套结构
2. 优点：支持具名参数
3. 优点：对排版引擎友好
4. 优点：性能影响小，一遍初始化
5. 优点：参数定义语法噪音小，普通 c++ 结构体
6. 缺点：参数顺序有要求，引入少量语法噪音
7. 缺点：在创建子树的时候难以嵌入复杂逻辑
8. 缺点：需要 C++ 20
### 方案 3：Lambda Tree
使用立即调用的 Lambda 来在表达式里注入代码块，典型代码如下
```cpp
SNew(SBorder) 
{
	p.Padding = InArgs.ThumbnailPadding;
	p.VAlign = VAlign_Bottom;
	p.HAlign = HAlign_Right;
	p.Padding = FMargin(3.0f, 3.0f);
	p.Child = SNew(STextBlock)
	{
		p.Font = DEFAULT_FONT("Regular", 8);
		p.AutoWrapText = false;
		p.LineBreakPolicy = FBreakIterator::CreateWordBreakIterator();
		p.Text = InArgs.DisplayName;
		p.ColorAndOpacity = FAppStyle::Get().GetSlateColor("Colors.Foreground");
	};
}
```
其优缺点分析如下：
1. 优点：树状的嵌套结构
2. 优点：支持具名参数
3. 优点：在创建子树的时候可以嵌入复杂逻辑
4. 优点：对排版引擎友好
5. 缺点：引入了变量 p 的语法噪音
6. 优点：参数定义语法噪音小，普通 c++ 结构体
7. 优点：调试友好，可断点
复杂逻辑的例子：
```cpp
SNew(SWidgetX)
{
	for(int i = 0; i < data.size(); ++i)
	{
		if(data[i].typeA)
			SNewChild(p.children, SWidgetA) { p.data = data[i]; }
		else
			SNewChild(p.children, SWidgetB) { p.data = data[i]; }
	}
}
```