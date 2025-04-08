<template>
  <div>
    <p>{{ propsMsg.msg }}</p>
  </div>
</template>

<script setup>
const propsMsg = defineProps({
  msg: String
});

console.log(propsMsg.msg);
</script>
