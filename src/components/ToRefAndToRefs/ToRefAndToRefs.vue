<script setup>
import {ref, toRefs} from "vue";

let msg = ref('hello');
let msg2 = ref('hel1lo');
let msg3 = ref('hel2lo');
const state = toRefs(
    msg,
    msg2,
    msg3
)
// 就比如这里
</script>

<template>
  <p>{{msg3}}</p>
</template>

<style scoped>

</style>