---
create: 2023-04-23 21:40
aliases: []
tags: [BuildSystem]
---
## 引入本地 xrepo
引擎使用的很多第三方库之前以提供源码+预编译二进制组合，通过在 xmake/thirdpatry 目录下编写 xmake target 的形式引入项目。这样的提供方式不仅管理麻烦，也会带来很多链接 BUG。
因此引入本地 xrepo，以安装项目内置 package 的形式进行依赖管理。xrepo 的 packages 有自己的目录组织形式，非常清晰，可以直接参照项目内的 [local xrepo](https://github.com/SakuraEngine/SakuraEngine/tree/main/xrepo/packages) 格式放置。

## 编写本地 package
不同于官方 xrepo 中通过 Github Repo URL 远程引入的形式，遵循 mono repo 的原则，SakuraEngine 要求引入的所有 xrepo 提供全部的源码。通过 `os.cp` 的形式安装源码到工作目录。

``` lua
package("cgltf")
    set_homepage("https://github.com/jkuhlmann/cgltf/")
    set_description("Single-file/stb-style C glTF loader and writer")
    set_license("MIT License")
    add_versions("1.13.0-skr", "aaa7f309efdc5b964e63576489d79f767fb06b7e5e6907dc3ff7001c62f053cd")

    on_install(function (package)
        os.mkdir(package:installdir()) -- this is important because xmake may not create the intermediate directory
        os.cp(path.join(package:scriptdir(), "port", "cgltf"), ".")
        os.cp(path.join(package:scriptdir(), "port", "xmake.lua"), "xmake.lua")
  
        local configs = {}
        import("package.tools.xmake").install(package, configs)
    end)
```
可以注意到，我们会在版本号末尾引入 ``-skr`` 这一独特的版本标记。在 target 引入依赖时，也要遵循如下形式：
``` lua
add_requires("icu >=72.1.0-skr", {system = false})
```
这样本地引入的方式也意味着 package 的源码是可以自由修改的（但要遵循库的协议）。每次更改代码，需要改动 pacakge 的 version 以确保包的版本安全。对修改过的包，要求的 version 格式如下：

``` lua
add_versions("1.13.0-skr.1", "...")
```

## Pacage Cache with Github Actions
Github Actions 上已经为 xrepo 开启了缓存，缓存文件的命名如下：
``` text
MSVC-${{ matrix.arch }}-${{ matrix.os }}-${{ matrix.toolchain }}-${{ matrix.cxx }}-${{ steps.dep_hash.outputs.hash }}-W${{ steps.cache_key.outputs.key }}
```
每次变动 local repo 会引起 xmake dephash 的刷新，会自动在 Actions 上重建缓存，不需要任何手动刷新操作。缓存文件会以周为间隔强制更新。