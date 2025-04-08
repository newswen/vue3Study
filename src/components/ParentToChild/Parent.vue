<template>
  <Child :msg="parentMessage" />
</template>

<script setup>
import {ref} from 'vue';
import Child from "@/components/ParentToChild/Child.vue";

const parentMessage = ref("Hello from Parent");
</script>
