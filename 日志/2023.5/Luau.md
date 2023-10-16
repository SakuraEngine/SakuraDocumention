如[[Lua|之前所说]]将 lua 初步替换为了 luau。
luau 的类型系统是完全用于检查的，它的编译和执行都是完全无视类型标注的。也不存在 Typescript 那种 TS 到 JS 的翻译过程。
luau 删除了绝大部分 platform 相关的功能，包括 `dofile` 和 `require` 等，以提供沙箱环境保障安全性，这对引擎来说也是有利的一个改动，通过手动实现这些功能将脚本完全纳入引擎 runtime 的管辖内，比如 require 将通过 vfs 来查找文件。
在 IDE 方面，目前初步测试了一下 vscode 相关的插件是能用的，但是对于引入 c++ porting 的类型定义还有一些问题，需要使用一个完全没有文档的 type definition 格式，且插件不支持热重载这个文件。