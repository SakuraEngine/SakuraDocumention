---
create: 2023-04-23 21:40
aliases: []
tags: [Render/Shader, Animation]
---
着色器、纹理和 GLTF 资产的导入器和烘焙器已经有了初步实现。
## 着色器烘焙器
接受引擎的着色器资产（目前仅 HLSL），穷举**变体**并编译出着色器字节码（dxil & spv）。烘焙器会产出一个**资源**用于字节码**索引**，规则详情见 **着色器变体 **部分；
## 纹理烘焙器 
接受引擎的纹理资产（支持 jpg 和 png 格式），调用纹理压缩器产出 DXT / ASTC（WIP） 压缩纹理。 [[资产架构#烘焙|烘焙器]] 会产出一个**资源**用于纹理数据**索引**，该资源也会包含纹理的**格式**和**尺寸**等信息；
## GLTF 烘焙器
GLTF 烘焙器包含 **网格烘焙器**、**骨骼烘焙器**、**动画烘焙器**以及**蒙皮烘焙器**。GLTF 格式是非常出色的**中间格式**，其 buffer 和 view 等概念使得我们可以非常轻松地提取关注的信息，并筛排到 GPU 亲和的格式。
### 网格烘焙器
网格烘焙器从 GLTF 中提取**网格信息**，包括**索引**、**顶点缓冲**以及**材质（WIP）**等。网格资产需要提供引擎中注册的顶点布局，烘焙器会将 GLTF 的顶点筛排到对应的数据布局，并存储到 buffer 文件中。在运行时，资源安装器会根据**资产配置**和**运行时环境**选取合适的方式（**内存上传**或是**DirectStorage**）读取 buffer 文件，并安装对应的网格数据。
对于**蒙皮网格**，由于 CPU Skin 需要读取 POS/NORM/TANGENT 信息并在 CPU 上进行蒙皮计算，烘焙器会把它们拆分成两块 buffer，buffer0 包含 UV 等静态信息，buffer1 包含需要蒙皮驱动的空间信息。而对于**静态网格**，烘焙器会将其网格信息全部打包到一块 buffer 中，运行时会通过 DirectStorage 直接安装到显存上。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1036225/1669796449678-440ac189-7c4c-47fd-9656-3c8342a7c592.png#averageHue=%231e1e1e&clientId=ud3fa998b-808b-4&from=paste&height=605&id=u62aeb0f2&name=image.png&originHeight=756&originWidth=851&originalType=binary&ratio=1&rotation=0&showTitle=false&size=102845&status=done&style=none&taskId=uf81d1812-519e-4b85-94e4-1981c1adc5a&title=&width=680.8)
### 骨骼烘焙器 & 动画烘焙器 & 蒙皮烘焙器
骨骼、动画与蒙皮烘焙器提取 GLTF 中的对应数据，构建对应的 **Ozz** 运行时数据结构并存储成 **资源**。蒙皮数据在 GLTF 中通过**节点**与**顶点数据**相互关联，我们的运行时数据结构也采用这种形式。
值得一提的是，**蒙皮数据**可能包含了大量字符串，我们使用了引擎提供的 **BlobBuilder **为它提供了运行时反序列化的内存布局优化。这是一种通过代码生成实现的 **超轻量 schema**，这些只读的字符串会被紧密地排布在一起，并序列化到指定的 **arena **中。在被资源管理器安装后，我们可以使用 View 来访问它们。
```cpp
sreflect_struct("guid": "C387FD0E-83BE-4617-9A79-589862F3F941") 
sattr("blob" : true)
skr_skin_blob_view_t
{
    eastl::string_view name;
    gsl::span<eastl::string_view> joint_remaps;
    gsl::span<skr_float4x4_t> inverse_bind_poses;
};
GENERATED_BLOB_BUILDER(skr_skin_blob_view_t)

sreflect_struct("guid" : "332C6133-7222-4B88-9B2F-E4336A46DF2C")
sattr("rtti" : true, "serialize" : "bin")
skr_skin_resource_t
{
    spush_attr("no-rtti" : true)
    skr_blob_arena_t arena;
    spush_attr("arena" : "arena")
    skr_skin_blob_view_t blob;
};
```
