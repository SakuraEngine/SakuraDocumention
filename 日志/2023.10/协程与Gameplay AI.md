---
create: 2023-10-18 13:28
aliases: 
tags:
  - CPP
  - Gameplay
  - "#Gameplay/AI"
---
## 行为树与状态机
行为树可以看作没有 **状态转移** 逻辑的状态机变体，主要优势是通过分层的节点减少了存在 **打断/失败转移** 时的大量重复转移逻辑。当然，通过对状态机的一些扩展：分层状态机，中转节点等，也可以一定程度上解决问题。
## 基于事件的行为树
基于事件的行为树通过注册回调和事件来运行逻辑，相比纯轮询模式可以视作是是一种优化的手段，相对的引入了回调生命周期管理的复杂度。
## 基于协程的行为树
行为树本身可以视作一种相对线性的，并发的过程，而 **协程本身也是一种顺序的状态机变体**，一定程度上两者有很强的相似性。基于这种相似性可以通过协程来实现行为树。
并且协程可以解决行为树的一个常见痛点：临时状态的传递，比如
1. 获取一个停车位
2. 进入这个停车位
在传统行为树中，这个 ``停车位`` 变量需要通过黑板来传递，容易导致黑板充满临时变量，当然这么做带来优势是内存可以一次性全部分配好。
协程行为树一段示例代码如下：
```cpp
struct npc
{
    coaction<> move(cocontext_t& ctx, double target)
    {
        //set animation to idle
        while(current != target)
        {
            //set animation to walk
            double deltaTime = co_await ctx.next_frame();
            current += std::min(target - current, 1.0 * deltaTime);
            
            SKR_LOG_WARN(u8"TIME:%lf POS:%lf", ctx.time, current);
        }
        co_return succeed;
    }

    coaction<> wait(cocontext_t& ctx, double time)
    {
        co_await ctx.wait(time);
        co_return succeed;
    }

    coaction<> test(cocontext_t& ctx)
    {
        co_await move(ctx, 10);
        co_await wait(ctx, 20);
        auto [a, b] = co_await race(ctx, move(ctx, 30), wait(ctx, 5));
        if(a == coaction_state::succeed)
        {
            SKR_LOG_WARN(u8"MOVE SUCCEED");
        }
        else
        {
            SKR_LOG_WARN(u8"MOVE FAILED");
        }
        co_await wait(ctx, 10);
        co_await move(ctx, 20);
        co_return succeed;
    }

    double current = 0;
};

int main()
{
    npc n;
    cocontext_t ctx;
    auto root = n.test(ctx);
    root.resume();
    for(int i=0; i<100; ++i)
    {
        ctx.update(i * 1, true);
    }
}
```
其中 coaction 就是一个行为节点，通过：
* ``SKR_DEFER`` 也就是 RAII 来执行清理逻辑
* ``co_return succeed;`` 或 ``co_return value;`` 来报告执行成功
* ``co_return failed;`` 来报告执行失败
* ``co_await event;`` 来等待事件
* ``co_await node;`` 来串联子节点
其中和行为树常见节点的对应关系为：
* parallel 节点 ：parallel 函数，所有子协程共同执行，所有子协程成功后唤醒父协程
* race 节点 ：race 函数，所有子协程共同执行，当某个子协程成功后打断其他子协程并唤醒父协程
* sequence 节点 ：await action，异步转同步，依次等待子协程完成
* select 节点：if，基础条件判断
### 缺陷与方案
协程是一个相对强顺序的结构，对于网络同步这种带有回滚需求的地方会带来一些复杂度，对于回滚的解决方案是：对所有行为记录执行状态（预测，执行，跳过），每次回滚后从头执行：
```cpp
coaction<> move(cocontext_t& ctx, double target)
{
	if(STATE == SKIP)
	{
		return;
	}
	else if(STATE == APPLY)
	{
		current = target;
	}
	else if(STATE == PREDICT)
	{
		//...
	}
}
```
