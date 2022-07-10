<template>
    <div class="wordEditor" id="wordEditor" ref="wordEditor">
    </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watchEffect } from 'vue';

const props = defineProps<{
    value: File | Blob,
    fileApplyRemoveHandler?: Function
}>()

async function save(writeAble: FileSystemWritableFileStream) {
}

defineExpose({
    editMode: "PREVIEWANDEDITOR",
    save
})

const wordEditor = ref<HTMLElement>();
/* fetch and parse workbook -- see the fetch example for details */
watchEffect(async () => {
  mammoth.convertToHtml({arrayBuffer: await props.value.arrayBuffer()})
    .then((results: {
      massage: string[],
      value: string
    }) => {
      if (wordEditor.value) {
        wordEditor.value.innerHTML = results.value
      }
  })
      .done();
    // (wordEditor.value as HTMLElement).innerHTML = output.join("\n");
})

onUnmounted(() => props.fileApplyRemoveHandler && props.fileApplyRemoveHandler());
</script>

<style lang="scss" scoped>
.sheetEditor:deep {
    table {
        border: 1px solid;
        [contenteditable="true"] {
            outline: none;
        }
        td {
            border: 1px solid;
            padding: 5px;
        }
    }
}
</style>