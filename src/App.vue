<template>
  <!-- <h1>doc:</h1> -->
  <section>
    <!-- <p>浏览器请求fileSystem</p>
    <p>1.请求配额 navigator.webkitPersistentStorage.requestQuota</p>
    <p>2.requestFileSystem 请求文件系统</p>
    <div class="center">
      <img src="./doc/fileSystem.jpg" alt="fileSystem架构" width="500" />
    </div> -->
    <moCard width="95%" padding="20px" class="mx-auto my-2">
      <moButtons class="mr-1" @click="createDir" size="small" type="outline">
        新建文件夹
      </moButtons>
      <moButtons @click="createDir" size="small" type="outline">
        新建文件
      </moButtons>
      <div class="m-2">
        <v-md-editor v-model="text" height="70vh"></v-md-editor>
      </div>
    </moCard>
  </section>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";
import { errorHandler, getfileSystemDirctroy } from "./ulits";

declare const navigator: any;
declare const webkitRequestFileSystem: any;

export default defineComponent({
  name: "App",
  data() {
    return {
      text: "mk-editor",
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
    async createDir() {
      const directoryHandle = await window.showDirectoryPicker();
      const entryItor = directoryHandle.entries();
      const toolFX = () => {
        entryItor.next().then((v: AsyncIterator) => {
          console.log(v);
          if (!v.done) {
            toolFX();
          }
        });
      };
      toolFX();
    },
  },
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
