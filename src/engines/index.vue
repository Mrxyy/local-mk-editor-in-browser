<template>
    <teleport :to="root">
        <div class="customEditor" id="customEditor" ref="customEditor">
            <slot>customEditor</slot>
        </div>
    </teleport>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
const root = ref<string>('body');
const customEditor = ref<HTMLElement | null>(null);
onMounted(() => {
    root.value = ".v-md-editor-preview";
    const el: HTMLElement | null = customEditor.value;
    if (el) {
        nextTick(() => (el.previousElementSibling as HTMLElement).classList.add("hidden"));
    }
    console.log(el);
})
onBeforeUnmount(() => {
    const el: HTMLElement | null = customEditor.value;
    if (el) {
        (el.previousElementSibling as HTMLElement).classList.remove("hidden");
    }
})
</script>
