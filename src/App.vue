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
        <div class="p-2 border mr-2 rounded-l shadow ring-offset-1">
          <moLeftListMenu
            ref="moLeftListMenu"
            class="w-max"
            :value="menuData"
            :activeItem="[3]"
            :fileOpenHandler="fileOpenHandler"
          ></moLeftListMenu>
        </div>
        <div class="w-full">
          <v-md-editor v-model="text" height="70vh"></v-md-editor>
        </div>
      </div>
    </moCard>
  </section>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";
import { errorHandler, getfileSystemDirctroy } from "./ulits";

declare const navigator: any;
declare const webkitRequestFileSystem: any;

interface MenuGenerator {
  id?: string
  name: string
  expand?: boolean
  children?: MenuGenerator | undefined | []
}

class MenuGenerator implements MenuGenerator {
  constructor({ id = '', name, expand = false, children = undefined }: MenuGenerator) {
    this.id = id,
      this.name = name,
      this.expand = expand,
      this.children = children
  }
}

function getParamFromEntry(handle: FileSystemHandle): MenuGenerator {
  return {
    id: handle.name,
    name: handle.name,
    expand: false,
    children: handle.kind != "file" ? [] : undefined
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
    const instance = getCurrentInstance();
    var requestedBytes = 1024 * 1024 * 10; // 10MB
    navigator.webkitTemporaryStorage.queryUsageAndQuota(
      (usedBytes: number, grantedBytes: number) => {
        // 检查主机使用和剩下
        console.log("we are using ", usedBytes, " of ", grantedBytes, "bytes");
        console.log(grantedBytes, requestedBytes);
        if (grantedBytes < requestedBytes) {
          console.log("储存不够");
        } else {
          navigator.webkitPersistentStorage.requestQuota(
            requestedBytes,
            (grentedSzie: number) => {
              console.log("授权大小", grentedSzie); // 授权大小
              webkitRequestFileSystem(
                PERSISTENT,
                grantedBytes,
                (fs: FileSystem) => {
                  getfileSystemDirctroy(fs, "/test", (dirEntry) => {
                    console.log(dirEntry);
                  });
                  // fs.root.createReader().readEntries(function (results) {
                  //   console.log(results);
                  // }, errorHandler);
                  fs;
                },
                errorHandler
              );
            },
            errorHandler
          );
        }
      },
      errorHandler
    );
  },
  methods: {
    async openProject() {
      const directoryHandle = await window.showDirectoryPicker();
      console.log(getParamFromEntry(directoryHandle));
      const rootParameter = getParamFromEntry(directoryHandle);
      rootParameter.expand = true;
      const root: MenuGenerator = new MenuGenerator(rootParameter)

      const entryItor = directoryHandle.entries();
      const toolFX = () => {
        entryItor.next().then((v: AsyncIterator) => {
          console.log(v);
          if (!v.done) {
            const [name, handle] = v.value
            console.log(getParamFromEntry(handle));
            const menuItem: MenuGenerator = new MenuGenerator(getParamFromEntry(handle))
            root.children.push(menuItem)
            toolFX();
          } else {
            this.menuData.push(root)
          }
        });
        // console.log( entryItor.next())
        // toolFX();
      };
      toolFX();
      console.log(this.menuData)
    },
    createDirectory() { },
    createfile() { },
    fileOpenHandler(v: any) {
      console.log(v);
    },
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
</style>
