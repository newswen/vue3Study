<script setup>
import {ref, onMounted} from 'vue';
import * as echarts from 'echarts';

const baseUrl = "http://192.168.0.145:9999/thirdnet/";
let previousWarehouseData = ref(null);
let previousLogisticsData = ref(null);
let previousTimeSpanData = ref(null);
const preNormalTitle = ref(null);
const preTimeTitle = ref(null);
let isShow = ref(false);
let tipMessage = ref('');

const asinInput = ref('');
const startDate = ref('');
const endDate = ref('');

function fetchData() {
  preNormalTitle.value = asinInput.value + " ASIN订单送达时间分布图";
  preTimeTitle.value = asinInput.value + " ASIN订单送达时间占比图";

  if (!asinInput.value || !startDate.value || !endDate.value) {
    alert("请输入 ASIN 和时间范围");
    return;
  }

  clearCharts();
  showPopup("正在查询中，请稍等...");

  // 显示弹窗的函数
  function showPopup(message) {
    // const popup = document.getElementById('popup');
    // const popupMessage = document.getElementById('popupMessage');
    // popupMessage.textContent = message;  // 设置弹窗消息内容
    // popup.style.display = 'block';  // 显示弹窗
    isShow.value = true;
    tipMessage.value = message;

    // 2秒后隐藏弹窗
    setTimeout(() => {
      // popup.style.display = 'none';
      isShow.value = false;
    }, 2000);
  }


  fetch(baseUrl + "amazon/asinOrderReport", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({asin: asinInput.value, startDate: startDate.value, endDate: endDate.value})
  })
      .then(response => response.json())
      .then(data => {
        if (data.code === 1 && !data.data) {
          showPopup(data.msg);  // 调用显示弹窗的函数
          return;
        }
        // 显示包含图表的容器
        document.getElementById("allChartsContainer").style.display = 'flex';
        document.getElementById("timeSpanChartsContainer").style.display = 'flex';

        let responseData = data.data;

        if (responseData.normalDistributionVO) {
          drawNormalChart({
            xAxis: responseData.normalDistributionVO.xAxis,
            yAxis: responseData.normalDistributionVO.yAxis,
            percentage: responseData.normalDistributionVO.percentage
          }, preNormalTitle.value, 'allNormalChart');
        }

        if (Array.isArray(responseData.warehousePieChartVOList)) {
          previousWarehouseData = responseData.warehousePieChartVOList.map(item => ({
            id: item.id,
            name: item.realWarehouseName,
            value: item.percentage
          }));
          drawPieChart('warehousePie', '仓库类型占比图', previousWarehouseData);
        }

        if (Array.isArray(responseData.logisticsTypePieChartVOList)) {
          previousLogisticsData = responseData.logisticsTypePieChartVOList.map(item => ({
            name: item.type,
            value: item.percentage
          }));
          drawPieChart('logisticsPie', '物流类型占比图', previousLogisticsData);
        }

        if (Array.isArray(responseData.orderTimeSpanPieChartVOList)) {
          previousTimeSpanData = responseData.orderTimeSpanPieChartVOList.map(item => ({
            name: item.orderTimeSpan + '天',
            value: item.percentage
          }));
          drawTimePieChart('allTimePie', preTimeTitle.value, previousTimeSpanData);
        }
      })
      .catch(error => {
        console.error("数据获取失败:", error);
        alert("查询失败，请检查后端服务");
      });
}

function drawNormalChart(data, title, elementId) {
  let chart = echarts.init(document.getElementById(elementId));
  let option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {fontSize: 20, fontWeight: 'bold', color: '#333'}
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      borderColor: '#ccc',
      textStyle: {color: '#fff'},
      formatter: function (params) {
        let index = params[0].dataIndex; // 获取当前索引
        let xValue = params[0].data[0]; // 当前 x 轴数值
        let yValue = params[0].data[1]; // 当前 y 轴概率密度
        let percentage = data.percentage[index]; // 直接从 data.percentage 获取小于等于当前天数的百分比
        return `[表情] <strong>送达时间：</strong> <span style="color:#f5f5f5">${xValue}</span> 天<br/>
                            [表情] <strong>概率密度：</strong> <span style="color:#f5f5f5">${yValue.toFixed(5)}</span><br/>
                            [表情] <strong>累计送达率：</strong> <span style="color:#f5f5f5">${percentage.toFixed(2)}%</span>
                            <small>(≤${xValue} 天的订单百分比)</small>`;
      }
    },
    xAxis: {
      type: 'value',
      name: '送达时间(天)',
      axisLine: {lineStyle: {color: '#555'}},
      axisLabel: {fontSize: 11}
    },
    yAxis: {
      type: 'value',
      name: '概率密度',
      axisLine: {lineStyle: {color: '#555'}},
      axisLabel: {fontSize: 12}
    },
    series: [{
      type: 'line',
      data: data.xAxis.map((x, i) => [x, data.yAxis[i]]),
      smooth: true,
      lineStyle: {color: '#ff5733', width: 3},
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: 'rgba(255, 87, 51, 0.5)'},
          {offset: 1, color: 'rgba(255, 87, 51, 0)'}
        ])
      },
      itemStyle: {opacity: 0},
      animationDuration: 1500
    }]
  };
  chart.setOption(option);
}

function drawPieChart(elementId, title, data) {
  let chart = echarts.init(document.getElementById(elementId));
  let option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {fontSize: 20, fontWeight: 'bold', color: '#333'}
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%'
    },
    legend: {top: '5%', left: 'center'},
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {show: false, position: 'center'},
        emphasis: {
          label: {show: true, fontSize: 40, fontWeight: 'bold'}
        },
        labelLine: {show: false},
        data: data
      }
    ]
  };
  chart.setOption(option);

  chart.on('click', function (params) {
    const selectedData = params.data;
    const type = elementId === 'warehousePie' ? 'wareHouseId' : 'logisticType';
    const value = elementId === 'warehousePie' ? selectedData.id : selectedData.name;
    const wareHouseTitle = selectedData.name;
    fetchConditionalData(value, type, wareHouseTitle);
  });

}

function drawTimePieChart(elementId, title, data) {
  let chart = echarts.init(document.getElementById(elementId));
  let option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {fontSize: 20, fontWeight: 'bold', color: '#333'}
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%'
    },
    legend: {top: '5%', left: 'center'},
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,  // 默认显示标签
          position: 'outside',  // 让标签显示在外圈
          formatter: '{b}: {d}%',
          fontSize: 14,
          fontWeight: 'bold'
        },
        labelLine: {
          show: true,  // 显示指引线
          length: 10,  // 指引线长度
          length2: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            formatter: '{b}: {d}%'
          }
        },
        data: data
      }
    ]
  };
  chart.setOption(option);
}


function fetchConditionalData(value, type, wareHouseTitle) {

  fetch(baseUrl + "amazon/conditionalDist", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      asin: asinInput.value, startDate: startDate.value, endDate: endDate.value,
      [type]: value
    })
  })
      .then(response => response.json())
      .then(data => {
        if (data.code === 1 && !data.data) {
          showPopup(data.msg);  // 调用显示弹窗的函数
          return;
        }

        // 显示包含图表的容器
        swapCharts();
        document.getElementById("conditionalChartsContainer").style.display = 'flex';
        document.getElementById("conditionTimePie").style.opacity = 1;

        let responseData = data.data;
        let normalDistributionTitle, orderTimeBarChartTitle, conditionTimePieTitle;
        if (type === 'wareHouseId') {
          normalDistributionTitle = "仓库" + wareHouseTitle + " 订单送达时间分布图";
          orderTimeBarChartTitle = "仓库" + wareHouseTitle + " 订单时间柱状图";
          conditionTimePieTitle = "仓库" + wareHouseTitle + " 订单送达时间占比图";
        } else {
          normalDistributionTitle = "物流" + value + " 订单送达时间分布图";
          orderTimeBarChartTitle = "物流" + value + " 订单时间柱状图";
          conditionTimePieTitle = "物流" + value + " 订单送达时间占比图";
        }
        if (responseData.normalDistributionVO) {
          drawNormalChart({
            xAxis: responseData.normalDistributionVO.xAxis,
            yAxis: responseData.normalDistributionVO.yAxis,
            percentage: responseData.normalDistributionVO.percentage
          }, normalDistributionTitle, 'conditionalNormalChart');
        }
        if (Array.isArray(responseData.asinOrderTimeBarChartVOList)) {
          let barData = responseData.asinOrderTimeBarChartVOList.map(item => [
            item.deliverDate, item.orderDate, item.avgOrderDate, item.pickupDate, item.avgPickupDate, item.shipDate, item.avgShipDate
          ]);
          drawOrderTimeBarChart(barData, orderTimeBarChartTitle);
        }
        if (Array.isArray(responseData.orderTimeSpanPieChartVOList)) {
          previousTimeSpanData = responseData.orderTimeSpanPieChartVOList.map(item => ({
            name: item.orderTimeSpan + '天',
            value: item.percentage
          }));
          drawTimePieChart('conditionTimePie', conditionTimePieTitle, previousTimeSpanData);
        }
      })
      .catch(error => {
        console.error("获取正态分布数据失败:", error);
        alert("获取正态分布数据失败，请检查后端服务");
      });
}

function drawOrderTimeBarChart(data, title) {
  let chart = echarts.init(document.getElementById('orderTimeBarChart'));

  // 动态生成 xAxis 数据，假设 data 的每个元素都有 3 个时间点
  let xAxisData = data.map((_, index) => (index + 1).toString());  // 生成 '1', '2', ..., 'n' 格式的字符串

  let option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {fontSize: 20, fontWeight: 'bold', color: '#333'}
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      borderColor: '#ccc',
      textStyle: {color: '#fff'},
      formatter: function (params) {
        let index = params[0].dataIndex; // 获取当前索引
        let deliverDate = data[index][0]; // 送达时间
        // 获取普通时间值
        let orderDate = data[index][1];
        let pickupDate = data[index][3];
        let shipDate = data[index][5];
        // 获取平均时间值
        let avgOrderDate = data[index][2];
        let avgPickupDate = data[index][4];
        let avgShipDate = data[index][6];

        return `<strong>[表情] 送达天数:</strong> <span style="color:#ff5733;">${deliverDate}</span> 天<br/>
                            <strong>[表情] 下单 → 拣货:</strong> <span style="color:#3498db;">${orderDate}</span> 天
                            （平均天数: <span style="color:#2ecc71;">${avgOrderDate.toFixed(2)}</span> 天）<br/>
                            <strong>[表情] 拣货 → 发货:</strong> <span style="color:#3498db;">${pickupDate}</span> 天
                            （平均天数: <span style="color:#2ecc71;">${avgPickupDate.toFixed(2)}</span> 天）<br/>
                            <strong>[表情] 发货 → 送达:</strong> <span style="color:#3498db;">${shipDate}</span> 天
                            （平均天数: <span style="color:#2ecc71;">${avgShipDate.toFixed(2)}</span> 天）`;

      }
    },
    legend: {top: '5%', left: 'center'},
    xAxis: {
      type: 'category',
      name: '订单数量',
      data: xAxisData,  // 使用动态生成的 xAxis 数据
      axisLabel: {fontSize: 12}
    },
    yAxis: {
      type: 'value',
      // name: '天数',
      axisLine: {lineStyle: {color: '#555'}},
      axisLabel: {fontSize: 12}
    },
    series: [
      {
        name: '下单-拣货时间(天数)',
        type: 'bar',
        stack: 'total',
        data: data.map(item => item[1])
      },
      {
        name: '拣货-发货时间(天数)',
        type: 'bar',
        stack: 'total',
        data: data.map(item => item[3])
      },
      {
        name: '发货-送达时间(天数)',
        type: 'bar',
        stack: 'total',
        data: data.map(item => item[5])
      }
    ]
  };
  chart.setOption(option);
}

function swapCharts() {
  let timeSpanDiv = document.getElementById("timeSpanChartsContainer");
  let conditionalDiv = document.getElementById("conditionalChartsContainer");

  // 获取它们的父级容器
  let parent = timeSpanDiv.parentNode;

  // 交换它们的顺序
  parent.insertBefore(conditionalDiv, timeSpanDiv);
}


function clearCharts() {
  document.getElementById("conditionalChartsContainer").style.display = 'none';
  document.getElementById("allChartsContainer").style.display = 'none';
  document.getElementById("timeSpanChartsContainer").style.display = 'none';
  document.getElementById("conditionTimePie").style.opacity = 0;
  let charts = ['allNormalChart', 'warehousePie', 'logisticsPie', 'conditionalNormalChart', 'orderTimeBarChart', 'allTimePie', 'conditionTimePie'];
  charts.forEach(id => {
    const chart = echarts.getInstanceByDom(document.getElementById(id));
    if (chart) chart.dispose();
    document.getElementById(id).innerHTML = '';
  });
}

onMounted(() => {
  window.addEventListener('resize', function () {
    const chartIds = ['allNormalChart', 'warehousePie', 'logisticsPie', 'conditionalNormalChart', 'orderTimeBarChart', 'allTimePie', 'conditionTimePie'];
    chartIds.forEach(id => {
      const chart = echarts.getInstanceByDom(document.getElementById(id));
      if (chart) {
        chart.resize();
      }
    });
  });
});

</script>

<template>
  <div class="asin-report">
    <div class="filter-container">
      <div class="filter-card">
        <input type="text" v-model="asinInput" placeholder="请输入 ASIN">
        <div class="date-range">
          <input type="date" v-model="startDate">
          <span class="date-separator">-</span>
          <input type="date" v-model="endDate">
        </div>
        <button @click="fetchData()">[表情] 查询</button>
      </div>
    </div>

    <div class="container" id="allChartsContainer" style="display: none">
      <div class="chart-container chart-large" id="allNormalChart"></div>
      <div class="chart-container chart-small" id="warehousePie"></div>
      <div class="chart-container chart-small" id="logisticsPie"></div>
    </div>
    <div id="otherContainer">
      <!--订单送达时间占比图-->
      <div class="timeSpanContainer" id="timeSpanChartsContainer" style="display: none">
        <div class="chart-container chart-normal-width" id="allTimePie"></div>
        <div class="chart-container chart-bar-width" id="conditionTimePie" style="opacity: 0;"></div>
      </div>

      <div class="conditionalContainer" id="conditionalChartsContainer" style="display: none">
        <div class="chart-container chart-normal-width" id="conditionalNormalChart"></div>
        <div class="chart-container chart-bar-width" id="orderTimeBarChart"></div>
      </div>
    </div>

    <!-- 弹窗容器 -->
    <div id="popup" class="popup" v-show="isShow">
      <span>{{tipMessage}}</span>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.conditionalContainer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.timeSpanContainer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.chart-container {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
  transition: all 0.3s ease;
}

.chart-large {
  width: 100%;
  height: 500px;
}

.chart-small {
  width: 48%;
  height: 500px;
}

.chart-normal-width {
  width: 48%;
  height: 520px;
}

.chart-bar-width {
  width: 50%;
  height: 520px;
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input, button {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* 弹窗的样式 */
.popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  z-index: 9999;
  opacity: 0.8;
}

/* 让整个筛选区域成为悬浮卡片 */
.filter-container {
  display: flex;
  justify-content: center;
  padding: 2px;
}

/* 卡片样式 */
.filter-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #ffffff;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

/* 输入框美化 */
.filter-card input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
}

/* 输入框聚焦时增加阴影 */
.filter-card input:focus {
  border-color: #a1c5ec;
  box-shadow: 0px 0px 8px rgba(205, 223, 243, 0.3);
}

/* 日期输入框分隔符 */
.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-separator {
  font-size: 18px;
  color: #666;
}

/* 查询按钮美化 */
.filter-card button {
  background: linear-gradient(45deg, #62a7f3, #9ac1ec);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 悬浮时效果 */
.filter-card button:hover {
  background: linear-gradient(45deg, #639bd8, #7ab0fb);
  transform: scale(1.05);
  box-shadow: 0px 5px 15px rgba(115, 204, 241, 0.4);
}

/* 响应式优化（适配小屏幕） */
@media (max-width: 768px) {
  .filter-card {
    flex-direction: column;
    gap: 12px;
    padding: 15px;
  }

  .filter-card input,
  .filter-card button {
    width: 100%;
  }
}
</style>