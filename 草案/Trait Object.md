---
create: 2023-10-18 13:29
aliases: 
tags:
  - cpp
---
trait object 是基于 type erasure 的一种非侵入式多态做法，基本思路是把虚表从对象中拿出来放到外部，这么做的好处有：
* 非侵入式可以在不修改代码的前提下为已有的类增加多态能力
	* 可以将 free function 视为扩展函数来进行多态
* 多个 trait 可以更好的共存，不存在多继承中的对象头偏移问题
* 扩展的虚表在实例化时才生成，不实例化不会生成

缺点有：
* 外部虚表需要一个额外的指针来记录和传递，在参数上有传染性

示例代码如下：
```cpp
strait("guid" : "706B824D-6D6B-4A76-99D4-2F770558EC03")
struct mytrait
{
    GENERATED_BODY()

    void speak();

    sattr("getter" : "a")
    int getA();

    sattr("ext")
    void dosomething();
}

sobject("guid" : "706B824D-6D6B-4A76-99D4-2F770558EC03")
struct myobject
{
    void speak() { print("aaa"); }
    int a;
}

void dosomething(/*this*/ myobject* o)
{
    o->a = 10;
}

void test()
{
    myobject o;
    mytrait t = o;
    t.speak();
    t.dosomething();
    print(t.getA());
    
    skr::type::register_trait<mytrait, myobject>();
    //error: given point is either null or not a valid object
    skr::type::query<mytrait>(&o).speak();

    myobject* o2 = NewObject<myobject>();
    void* p = o2;
    skr::type::query<mytrait>(p).speak();
}
```
其中 ``mytrait`` 的展开代码如下：
```cpp
template <typename T>
struct mytrait_T {
  using Self = mytrait_T<T>;
  void (*speak)(void *self) = &Self::static_speak;
  static void static_speak(void *self) { return ((T *)self)->speak(); };
  int (*getA)(void *self) = &Self::static_getA;
  static int static_getA(void *self) { return ((T *)self)->a; };
  void (*dosomthing)(void *self) = &Self::static_dosomthing;
  static void static_dosomthing(void *self) { return dosomthing((T *)self); };
};

struct mytrait_impl {
  void (*add)(void *self, int);
};

struct mytrait {
  void *self = nullptr;
  mytrait() = delete;

  template <typename T>
  mytrait(T &t) : self(&t) {
    static mytrait_impl_T<T> impl;
    _impl = (mytrait_impl *)(void *)&impl;
  }

private:
  mytrait_impl *_impl;

public:
    void speak();
    int getA();
    void dosomething();
};
```

```cpp
void mytrait::speak() { return _impl->speak(self); }
int mytrait::getA() { return _impl->getA(self); }
void mytrait::dosomething() { return _impl->dosomething(self); }
```