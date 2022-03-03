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
      <moButtons class="mr-1" color="danger" @click="deleteEntry" size="small" type="outline">删除文件夹</moButtons>
      <moButtons class="mr-1" @click="createDirectory" size="small" type="outline">新建文件夹</moButtons>
      <moButtons @click="createfile" size="small" type="outline">新建文件</moButtons>
      <div class="flex m-2">
        <div class="p-2 border mr-2 rounded-l shadow ring-offset-1 side-menu">
          <moLeftListMenu
            ref="moLeftListMenu"
            class="w-max"
            :value="menuData"
            :fileOpenHandler="fileOpenHandler"
            :directoryOpenHandler="openDirectory"
          ></moLeftListMenu>
        </div>
        <div class="w-full">
          <v-md-editor :mode="editMode" @save="save" v-model="text" height="70vh"></v-md-editor>
          <customEditor v-if="isUseCustomEditor">
            <div class="p-4" v-if="currentContext.fileType === 'xlsx'">
              <sheetEditor :value="currentContext.fileObj" ref="fileHandler"></sheetEditor>
            </div>
          </customEditor>
        </div>
      </div>
    </moCard>
  </section>
</template>

<script lang="ts">
import { defineComponent, ComponentPublicInstance, reactive, nextTick } from "vue";
import { toast } from "memo-ui";
import { MenuGenerator, getParamFromEntry } from "./MenuGenerator";
import { errorHandler } from "./ulits";
import customEditor from "./engines/index.vue";
import mime from "./mime.json";

import sheetEditor from "./engines/sheet/index.vue"

declare const navigator: any;
declare const webkitRequestFileSystem: any;

interface CurrentContext {
  fileType: string,
  fileObj: File | null
}

interface dataResult {
  text: string;
  menuData: Array<MenuGenerator>;
  editMode: "edit" | "editable" | "preview";
  isUseCustomEditor: boolean;
  currentContext: CurrentContext;
}

enum customMode {
  PREVIEWANDEDITOR = "PREVIEWANDEDITOR"
}

export default defineComponent({
  name: "App",
  components: {
    customEditor,
    sheetEditor
  },
  data(): dataResult {
    return {
      text: "mk-editor",
      menuData: [],
      isUseCustomEditor: false,
      currentContext: {
        fileType: "text",
        fileObj: null
      },
      editMode: "edit",
    };
  },
  computed: {
    currentActive(this: ComponentPublicInstance): MenuGenerator {
      return (this.$refs as any).moLeftListMenu.currentActive;
    },
  },
  created() {
    var requestedBytes = 1024 * 1024 * 10; // 10MB
    navigator.webkitPersistentStorage.queryUsageAndQuota(
      (usedBytes: number, grantedBytes: number) => {
        // 检查主机使用和剩下
        console.log(
          "使用的量 ",
          usedBytes,
          " 剩余使用 ",
          grantedBytes,
          "bytes"
        );
        navigator.webkitPersistentStorage.requestQuota(
          usedBytes + requestedBytes,
          (grentedSzie: number) => {
            console.log("授权大小", usedBytes, requestedBytes); // 授权大小
            webkitRequestFileSystem(
              PERSISTENT,
              grantedBytes,
              (fs: FileSystem) => {
                this.addSubProject(fs.root);
              },
              errorHandler
            );
          },
          errorHandler
        );
      },
      errorHandler
    );
  },
  methods: {
    async openProject() {
      //1.获取项目目录
      const directoryHandle = await window.showDirectoryPicker();
      this.addSubProject(directoryHandle);
    },
    addSubProject(
      directoryHandle: FileSystemDirectoryHandle | FileSystemDirectoryEntry
    ) {
      const rootParameter = getParamFromEntry(directoryHandle);
      rootParameter.expand = true;
      const root: MenuGenerator = reactive(new MenuGenerator(rootParameter)); //不能使用 ref 因为 ref会进行对象转换，对比react ref
      this.openDirectory(root);
      this.menuData.push(root);
      console.log(this.menuData);
    },
    openDirectory(menuGenerator: MenuGenerator) {
      if (!menuGenerator.children || menuGenerator.children.length) {
        return;
      }
      const directoryHandle: FileSystemHandle = menuGenerator.entryHandler;
      const entryIterator = (
        directoryHandle as FileSystemDirectoryHandle
      ).entries();
      const toolFX = (parentDirectory: MenuGenerator) => {
        entryIterator.next().then((v) => {
          if (!v.done) {
            const [name, handle] = v.value;
            const menuItem = reactive<MenuGenerator>(
              new MenuGenerator(
                getParamFromEntry(handle as FileSystemHandle, menuGenerator)
              )
            );
            Array.isArray(parentDirectory.children) &&
              (parentDirectory.children as Array<MenuGenerator>).push(menuItem);
            toolFX(parentDirectory);
          }
        });
      };
      toolFX(menuGenerator);
      return;
    },
    async openFile(menuGenerator: MenuGenerator): Promise<File> {
      const fileEntryHanlder: FileSystemHandle = menuGenerator.entryHandler;
      const fileData: File = await (
        fileEntryHanlder as FileSystemFileHandle
      ).getFile();
      return fileData;
    },
    async createDirectory() {
      const parentEntry = this.currentActive;
      if (!parentEntry.children) {
        return;
      }
      toast.prompt({
        text: "输入文件夹名",
        onConfirm: async (folderName: string) => {
          if (folderName) {
            const directoryHandle: FileSystemDirectoryHandle = await (
              parentEntry.entryHandler as FileSystemDirectoryHandle
            ).getDirectoryHandle(folderName, {
              create: true,
            });
            (parentEntry.children as Array<MenuGenerator>).push(
              reactive<MenuGenerator>(
                new MenuGenerator(
                  getParamFromEntry(directoryHandle, parentEntry)
                )
              )
            );
          }
          return true;
        },
      });
    },
    async createfile() {
      const parentEntry = this.currentActive;
      if (!parentEntry.children) {
        return;
      }
      toast.prompt({
        text: "输入文件名",
        onConfirm: async (FileName: string) => {
          if (FileName) {
            const fileHandler: FileSystemFileHandle = await (
              parentEntry.entryHandler as FileSystemFileHandle
            ).getFileHandle(FileName, {
              create: true,
            });
            (parentEntry.children as Array<MenuGenerator>).push(
              reactive<MenuGenerator>(
                new MenuGenerator(getParamFromEntry(fileHandler, parentEntry))
              )
            );
          }
          return true;
        },
      });
    },
    async fileOpenHandler(v: any) {
      const file: File = await this.openFile(v);
      let type = Reflect.ownKeys(mime).find((v) => {
        return Reflect.get(mime, v).includes(file.type);
      });
      if (!type && /\.md|\.ts|\.yaml|\.css|\.scss$/g.test(file.name)) {
        type = "text";
        if (/\.md$/g.test(file.name)) {
          this.editMode = "editable";
        }
      } else if (/\.xlsx$/g.test(file.name)) {
        this.isUseCustomEditor = true;
        type = "xlsx";
        nextTick(() => {
          this.handleCustomModeShow((this.$refs.fileHandler as any).editMode)
        })
      } else {
        this.editMode = "edit";
      }

      this.currentContext.fileType = type as string;
      this.currentContext.fileObj = file;

      switch (type) {
        case "text":
          this.handleTextType(file);
          break;
      }
      console.log(file, type ? type : file.type + "can't handle");
    },
    handleCustomModeShow(mode: customMode) {
      switch (mode) {
        case (customMode.PREVIEWANDEDITOR):
          this.editMode = "editable";
          (document.querySelector(".v-md-editor__editor-wrapper") as HTMLElement).style.display = "none";
          break
      }
    },
    async handleSheet(file: File) {
    },
    async handleTextType(file: File) {
      this.text = await file.text();
    },
    async save(text: string, html: string) {
      const ableWriteStream = await (
        this.currentActive.entryHandler as FileSystemFileHandle
      ).createWritable();
      if (this.$refs.fileHandler) {
        await (this.$refs.fileHandler as any).save(ableWriteStream)
      } else {
        await ableWriteStream.write(new Blob([text]));
        // FileSystemDirectoryHandle.removeEntry()
      }
      (await ableWriteStream.close) && ableWriteStream.close();
    },
    async deleteEntry() {
      this.currentActive.parent &&
        (this.currentActive.parent.entryHandler as FileSystemDirectoryHandle)
          .removeEntry(this.currentActive.entryHandler.name, {
            recursive: true,
          })
          .then(() => {
            this.currentActive.parent?.children &&
              this.currentActive.parent.children.find(
                (v: MenuGenerator, i: number) => {
                  if (v === this.currentActive) {
                    this.currentActive.parent?.children &&
                      this.currentActive.parent.children.splice(i, 1);
                  }
                  return v === this.currentActive;
                }
              ); //?bugger 直接赋值没有触发更新，当[]复制又可以
          });
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
.side-menu {
  overflow-y: overlay;
  height: 70vh;
  scroll-behavior: smooth;
  flex-shrink: 0;
}
</style>
