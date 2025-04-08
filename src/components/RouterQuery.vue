<script setup>
import {useRoute} from 'vue-router';

// route 就是以前的 $route
const route = useRoute(); // route 就是以前的 $route
</script>

<template>
  <!-- 查询字符串传递-->
  <p>年龄：{{ route.query.age }}</p> <!-- 正确 ✅ -->
  <!--路径传递参数-->
  <p>姓名：{{ route.params.name }}</p>
</template>

<style scoped>

</style>