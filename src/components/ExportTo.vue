<script setup lang="ts">
const props = defineProps({
  from: String,
})

const emit = defineEmits(['toText', 'toCsv']);

const toText = () => {
  emit('toText', props.from);
};

const toCSV = () => {
  emit('toCsv', props.from);
};
</script>

<template>
  <div>
    <p class="mb-4">Export to:</p>
    <button class="btn mr-4" @click="toText">Text</button>
    <button class="btn" @click="toCSV">CSV</button>
  </div>
</template>
