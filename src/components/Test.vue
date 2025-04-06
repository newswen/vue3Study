<template>
  <div>
    <!-- 按钮 -->
    <button @click="showPopup('这是一个弹窗消息')">显示弹窗</button>

    <!-- 弹窗 -->
    <div class="popup" v-show="isShow">
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义响应式变量
let isShow = ref(false);
let message = ref('');

// 定义方法
const showPopup = (msg) => {
  message.value = msg;
  isShow.value = true;
  setTimeout(() => {
    isShow.value = false;
  }, 2000);
};
</script>

<style>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}
button {
  margin: 20px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>