目前 rtti 的实现使用了过多的 static 变量，将 module dll 中的地址注册到了 runtime 中，这阻碍了 hotfix 的开发，因为在 reload 的时候会产生很多悬空指针，目前重写了这部分代码，将类型实例都创建到 runtime 中了，并且提供了遍历某个模块注册的类型的能力，为 hotfix 更新类型信息做好准备。
重写的部分主要为：
* record/enum 在 runtime 中创建示例，并由 module 初始化，module 卸载后 type 内的回调依然会悬空，但是提供了判断和重新初始化的接口
* pointer/array/variant 等复合类型不再 static 构造而是运行时构造并通过 map 缓存
* array/variant 不再使用静态的函数指针类型擦除，而是实现了一份真正的动态版本逻辑