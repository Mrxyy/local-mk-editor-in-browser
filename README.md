# local-mk-editor-in-browser

## view
+ [local-mk-editor-in-browser](https://local-mk-editor-in-browser.glitch.me/)
+ [中国大陆](https://mypku.csb.app/)

## 关于
+ 目前只支持markdown的文件的和编写。
+ github：https://github.com/Mrxyy/local-mk-editor-in-browser。
+ ui: [memo-ui](https://github.com/Mrxyy/memo-ui)

## 相似产品
+ 和 vscode for web 一样，使用system access api 和local file system 进行通信。

### 区别
+ 使用了FileSystemDirectoryEntryHandler进行了创建文件夹和创建创建文件，目前在vscode for web中并没有实现。
+ vscode for web实现创建新建文件使用的是Window.showSavafilePicker创建文件，需要用户指定一个文件夹。

## 说明
+ 产品的诞生是因为开发的时候遇到一个bug的时候想记录一下，发现需要单开一个编辑器或者窗口十分麻烦而且电脑会因此卡顿，所以想找一个b端的markdown编辑器(可以修改电脑本地文件,并不是云端)但是没有找到。
+ 产品宗旨以简单轻量为主，目前产品只支持mk文件的预览，以及简单文本文件的编写，后面会丰富插件。

## 后期计划
+ 产品架构文档(system file,web stream,file system access)。
+ js console、html、图片、pdf 预览。
