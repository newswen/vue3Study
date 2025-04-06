<script setup>
import {ref} from 'vue'
import axios from 'axios';

let str = ref('');
let searchArray = ref([]);
let search = (strs) => {
  axios.get('http://localhost:8080/api/test', {
    params: {
      name: strs
    }
  }).then(res => {
    console.log(res);
    searchArray.value = res.data;
  }).catch(err => {
    console.log(err);
  })
}
</script>

<template>
  <input type="text" placeholder="请输入需要搜索的名词" v-model="str">
  <button @click="search(str)">搜索</button>
  <div>
    <ul>
      <li v-for="(item, index) in searchArray">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>