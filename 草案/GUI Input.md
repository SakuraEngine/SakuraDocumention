---
create: 2023-10-20 14:53
aliases: []
tags: []
---
延续并扩展 Flutter 的手势设计，并对于基础事件（Down/Up/Move/Hover）引入[[Input|路由机制]]。

对于 Focus 问题，Input 流送的第一目标永远是 Widget，而 Focus 的改变，则由在控件接收到事件之后决定，自动化的 Focus 也嵌入在这一层中