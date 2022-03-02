<template>
    <teleport :to="root">
        <div class="customEditor" id="customEditor" ref="customEditor">
            <slot>customEditor</slot>
        </div>
    </teleport>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
const root = ref<string>('body');
const customEditor = ref(null);
onMounted(() => {
    root.value = ".v-md-editor-preview";
    const el: HTMLElement = customEditor.value;
    if (el) {
        nextTick(() => el.previousElementSibling.style.display = "none")
    }
    console.log(el);

})
</script>