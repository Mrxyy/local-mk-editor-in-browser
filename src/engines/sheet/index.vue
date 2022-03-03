<template>
    <div class="sheetEditor" id="sheetEditor" ref="sheetEditor"></div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

const props = defineProps<{
    value: File | Blob,
}>()

async function save(writeAble: FileSystemWritableFileStream) {
    var htmlstr = (sheetEditor.value as HTMLElement).outerHTML;
    var workbook = XLSX.read(htmlstr, { type: "string" });
    var arrayBuf = XLSX.write(workbook, { type: "array" })
    var file = new File([arrayBuf], "test.xls", {
        type: "application/vnd.ms-excel",
    });
    await writeAble.write(file)
}

defineExpose({
    editMode: "PREVIEWANDEDITOR",
    save
})

const sheetEditor = ref<HTMLElement>();
/* fetch and parse workbook -- see the fetch example for details */
watchEffect(async () => {
    const workbook = XLSX.read(await props.value.arrayBuffer());

    let output: Array<string> = [];
    /* loop through the worksheet names in order */
    workbook.SheetNames.forEach((name: string) => {

        /* generate HTML from the corresponding worksheets */
        const worksheet = workbook.Sheets[name];
        const html = XLSX.utils.sheet_to_html(worksheet, { editable: true });

        /* add a header with the title name followed by the table */
        output.push(`${html}`);
    });
    /* write to the DOM at the end */
    (sheetEditor.value as HTMLElement).innerHTML = output.join("\n");
})
</script>

<style lang="scss" scoped>
.sheetEditor:deep {
    table {
        border: 1px solid;
        td {
            border: 1px solid;
            padding: 5px;
        }
    }
}
</style>