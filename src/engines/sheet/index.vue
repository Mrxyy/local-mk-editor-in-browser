<template>
    <div class="sheetEditor" id="sheetEditor"></div>
</template>

<script lang="ts" setup>
import { watch, watchEffect } from 'vue';

const { value: file } = defineProps<{
    value: File | Blob,
}>()
/* fetch and parse workbook -- see the fetch example for details */
watchEffect(async () => {
    const workbook = XLSX.read(await file.arrayBuffer());

    let output: Array<string> = [];
    /* loop through the worksheet names in order */
    workbook.SheetNames.forEach((name: string) => {

        /* generate HTML from the corresponding worksheets */
        const worksheet = workbook.Sheets[name];
        const html = XLSX.utils.sheet_to_html(worksheet, { editable: true });

        /* add a header with the title name followed by the table */
        output.push(`<H3>${name}</H3>${html}`);
    });
    /* write to the DOM at the end */
    console.log(customEditor);
    document.querySelector("#sheetEditor").innerHTML = output.join("\n");
    document.querySelector(".v-md-editor__editor-wrapper").style.display = "none"
})
</script>

<style lang="scss" scoped>
.sheetEditor {
    table {
        border: 1px solid;
        td {
            border: 1px solid;
        }
    }
}
</style>