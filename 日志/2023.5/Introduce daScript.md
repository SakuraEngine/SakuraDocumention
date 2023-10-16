非常强大的语言，被 GaijinEntertainment 广泛地在自家产品中使用。
-   **速度极快的**编程语言，即使在解释器模式下也可以与编译语言或 JIT 语言相媲美。它始终优于动态解释脚本语言，如 Lua。当在 AOT 模式下使用时，daScript 由于其 SSE 友好的 POD 类型，通常比单纯编写的 C++ 更快，它甚至超过了一些最好的 JIT VM，如 V8 或 LuaJIT。因此，无需用 C++ 重写 daScript 代码来优化性能。
-   **安全且通用的**编程语言，提供静态类型的所有优点。许多会在运行时用 Lua 或 JavaScript 等语言破坏应用程序的错误甚至不会在 daScript 中编译。此外，由于支持泛型、类型推断和宏，daScript 易于使用且流畅。安全是 daScript 设计的基本支柱，在许多情况下比 C++ 或 Java 等语言更安全。
-   真正的**嵌入式**编程语言，除了 C++17 编译器外不需要任何外部依赖。它的互操作功能非常易于使用且安全。

daScript 在编写常规代码时，采用 python-like 的语法，添加了一定的 C# 和 Swift 糖，产出的代码是非常简单且清晰的。
``` daScript
def update_gameplay(dt: float)
    update_bird(bird, dt)
    camera_x = bird.position.x - float(get_screen_width()) * 0.5
    for c in columns
        if !c.passed
            if (bird.position.x > c.posX && bird.position.x < c.posX + c.width &&
                (bird.position.y < c.holeTop || bird.position.y > c.holeBottom))
                kill_bird(bird)

            if c.posX + c.width < bird.position.x
                c.passed = true
                score++

    check_for_new_column()
    remove_out_of_screen_column()
```

但 daScript 还有大量的亮点功能，可以极大程度地提高语法修辞上限，例如类似 rust 过程宏的 AST 操作宏。通过在 simulate（预热）过程消耗一些时间对 AST 进行宏操作，让 daScript 可以轻松地实现各种嵌入式 DSL 或是代码结构化解析操作。例如 ECS 调度器可以解析一个 daScript 函数，插入数据查询的 AST，无感知地实现 ECS Query 功能：

https://github.com/GaijinEntertainment/daScript/blob/master/daslib/decs_boost.das#L207-L253

在游戏中，使用预热换来高执行性能是非常可接受的，这也是 daScript 最贴近游戏开发环境的核心设计理念。

SakuraEngine 中已经部分接入了 daScript。GaijinEntertainment 使用非常静态的方案，将 daScript 代码直接 archive 为 lib 后全静态地链接到程序中。这和 SakuraEngine 的 DLL 插件流程是不相容的（多个 DLL 实例链接到单个 lib 会产生冗余符号副本）。因此我们需要提供一个 daScript 插件，独立地链接到静态库，并导出我们需要的所有 daScript interop 功能。
- 脚本方式使用
- C++ 类和属性向 daScript 的导出
还不支持的特性有：
- TFunction（闭包）/TBlock（快速闭包）互操作
- AOT
我们会在后续版本中进行完善。