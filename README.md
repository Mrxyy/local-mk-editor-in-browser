# local-mk-editor-in-browser

## 关于
1.目前只支持markdown的文件的和编写。
2.github：https://github.com/Mrxyy/local-mk-editor-in-browser。

## 相似产品
1.和 vscode for web 一样，使用system access api 和local file system 进行通信。

### 区别
1.使用了FileSystemDirectoryEntryHandler进行了创建文件价和创建创建文件，目前在vscode中并没有实现。
2.vscode实现创建新建文件使用的是Window.showSavafilePicker创建文件，需要用户指定一个文件夹。

## 说明
1.产品的诞生是因为开发的时候遇到一个bug的时候想记录一下，发现需要单开一个编辑器或者窗口十分麻烦而且电脑会因此卡顿，所以想找一个b端的markdown编辑器没有找到。
2.产品宗旨以简单轻量为主，目前产品只支持mk文件的编译，以及简单文本文件的编写，后面会丰富插件。

## 后期计划
1.产品架构文档(system file,web stream,file system access)。
2.js console、html、图片、pdf 预览。