<template>
  <!-- <h1>doc:</h1> -->
  <section>
    <!-- <p>浏览器请求fileSystem</p>
    <p>1.请求配额 navigator.webkitPersistentStorage.requestQuota</p>
    <p>2.requestFileSystem 请求文件系统</p>
    <div class="center">
      <img src="./doc/fileSystem.jpg" alt="fileSystem架构" width="500" />
    </div>-->

    <moCard width="95%" padding="20px" class="mx-auto my-2">
      <moButtons class="mr-1" @click="openProject" size="small" type="outline">打开一个项目</moButtons>
      <moButtons class="mr-1" @click="createDirectory" size="small" type="outline">新建文件夹</moButtons>
      <moButtons @click="createfile" size="small" type="outline">新建文件</moButtons>
      <div class="flex m-2">
        <div class="p-2 border mr-2 rounded-l shadow ring-offset-1 side-menu">
          <moLeftListMenu
            ref="moLeftListMenu"
            class="w-max"
            :value="menuData"
            :fileOpenHandler="fileOpenHandler"
            :directoryOpenHandler="directoryOpenHandler"
          ></moLeftListMenu>
        </div>
        <div class="w-full">
          <v-md-editor @save="save" v-model="text" height="70vh"></v-md-editor>
        </div>
      </div>
    </moCard>
  </section>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, isReactive, isRef, toRef, ref, Ref, reactive, toRaw } from "vue";
import { errorHandler, getfileSystemDirctroy } from "./ulits";
import mime from "./mime.json"

declare const navigator: any;
declare const webkitRequestFileSystem: any;

interface MenuGenerator {
  id?: string
  name: string
  expand?: boolean
  children?: Array<Ref<MenuGenerator>> | undefined | []
  entryHandler: FileSystemHandle
}

class MenuGenerator implements MenuGenerator {
  constructor({ id = '', name, expand = false, children = undefined, entryHandler }: MenuGenerator) {
    this.id = id,
      this.name = name,
      this.expand = expand,
      this.children = children,
      this.entryHandler = entryHandler
  }
}

function getParamFromEntry(handler: FileSystemHandle): MenuGenerator {
  return {
    id: handler.name,
    name: handler.name,
    expand: false,
    children: handler.kind != "file" ? [] : undefined,
    entryHandler: handler
  }
}

export default defineComponent({
  name: "App",
  data(): any {
    return {
      text: "mk-editor",
      menuData: [],
      currentContext: {
        path: "/",
        fileName: "",
        fileObj: null,
      },
    };
  },
  setup() {
    // const instance = getCurrentInstance();
    // var requestedBytes = 1024 * 1024 * 10; // 10MB
    // navigator.webkitTemporaryStorage.queryUsageAndQuota(
    //   (usedBytes: number, grantedBytes: number) => {
    //     // 检查主机使用和剩下
    //     console.log("we are using ", usedBytes, " of ", grantedBytes, "bytes");
    //     console.log(grantedBytes, requestedBytes);
    //     if (grantedBytes < requestedBytes) {
    //       console.log("储存不够");
    //     } else {
    //       navigator.webkitPersistentStorage.requestQuota(
    //         requestedBytes,
    //         (grentedSzie: number) => {
    //           console.log("授权大小", grentedSzie); // 授权大小
    //           webkitRequestFileSystem(
    //             PERSISTENT,
    //             grantedBytes,
    //             (fs: FileSystem) => {
    //               getfileSystemDirctroy(fs, "/test", (dirEntry) => {
    //                 console.log(dirEntry);
    //               });
    //               // fs.root.createReader().readEntries(function (results) {
    //               //   console.log(results);
    //               // }, errorHandler);
    //               fs;
    //             },
    //             errorHandler
    //           );
    //         },
    //         errorHandler
    //       );
    //     }
    //   },
    //   errorHandler
    // );
  },
  methods: {
    async openProject() {
      //1.获取项目目录
      const directoryHandle = await window.showDirectoryPicker();
      const rootParameter = getParamFromEntry(directoryHandle);
      rootParameter.expand = true;
      const root: MenuGenerator = reactive(new MenuGenerator(rootParameter)) //不能使用 ref 因为 ref会进行对象转换，对比react ref
      this.openDirectory(root)
      this.menuData.push(root)

      console.log(this.menuData)
    },
    openDirectory(menuGenerator: MenuGenerator) {
      if (!menuGenerator.children || menuGenerator.children.length) {
        return;
      }
      const directoryHandle: FileSystemHandle = menuGenerator.entryHandler;
      const entryIterator = directoryHandle.entries();
      const toolFX = (parentDirectory: MenuGenerator) => {
        entryIterator.next().then((v: AsyncIterator) => {
          console.log(v);
          if (!v.done) {
            const [name, handle] = v.value
            console.log(getParamFromEntry(handle));
            const menuItem: MenuGenerator = reactive(new MenuGenerator(getParamFromEntry(handle)));
            Array.isArray(parentDirectory.children) && (parentDirectory.children as Array<MenuGenerator>).push(menuItem)
            toolFX(parentDirectory);
          }
        });
      };
      toolFX(menuGenerator);
      return;
    },
    async openFile(menuGenerator: MenuGenerator): Promise<File> {
      const fileEntryHanlder: FileSystemHandle = menuGenerator.entryHandler;
      const fileData: File = await fileEntryHanlder.getFile();
      return fileData
    },
    createDirectory() { },
    createfile() { },
    async fileOpenHandler(v: any) {
      const file: File = await this.openFile(v)
      let type = Reflect.ownKeys(mime).find((v) => {
        return Reflect.get(mime, v).includes(file.type)
      })
      if (!type) {
        type = /\.md$/g.test(file.name) ? 'text' : type
      }
      type = 'text'
      switch (type) {
        case 'text':
          this.handleTextType(file)
          break;
      }
      console.log(file, type ? type : file.type + "can't handle");

    },
    async handleTextType(file: File) {
      this.text = await file.text();
    },
    directoryOpenHandler(v: any) {
      console.log(v)
      this.openDirectory(v)
    },
    async save(text: string, html: string) {
      console.log(this.$refs.moLeftListMenu.currentActive.entryHandler, text);
      const ableWriteStream: { write: any } & WritableStream = await this.$refs.moLeftListMenu.currentActive.entryHandler.createWritable();
      console.log(ableWriteStream)
      await ableWriteStream.write(text);
      await ableWriteStream.close();
      FileSystemDirectoryHandle.removeEntry()
      // async function saveFile() {
      //   await ableWriteStream.write(text);
      //   await ableWriteStream.close();
      // }
      // saveFile()
      // console.log(await this.$refs.moLeftListMenu.currentActive.entryHandler.queryPermission({
      //   mode: 'readwrite'
      // }), await (await this.openFile(this.$refs.moLeftListMenu.currentActive)).text())
    }
  },
  mounted() {
    console.log(this.$refs.moLeftListMenu);
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
.center {
  text-align: 20px center;
}
.side-menu {
  overflow-y: overlay;
  height: 70vh;
  scroll-behavior: smooth;
  flex-shrink: 0;
}
</style>
