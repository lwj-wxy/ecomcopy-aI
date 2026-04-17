<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
  data: { category: string; searchVolume: number; growth: number }[];
}>();

const chartRef = ref<HTMLElement | null>(null);

const drawChart = () => {
  if (!chartRef.value || !props.data.length) return;

  // Clear previous chart
  d3.select(chartRef.value).selectAll('*').remove();

  const margin = { top: 20, right: 30, bottom: 40, left: 140 };
  const width = chartRef.value.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.searchVolume) || 0])
    .range([0, width]);

  const y = d3.scaleBand()
    .range([0, height])
    .domain(props.data.map(d => d.category))
    .padding(0.2);

  // Axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
    .style('color', '#94a3b8')
    .selectAll('text')
    .style('font-size', '10px');

  svg.append('g')
    .call(d3.axisLeft(y))
    .style('color', '#64748b')
    .selectAll('text')
    .style('font-size', '12px')
    .style('font-weight', '500');

  // Bars
  const bars = svg.selectAll('rect')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('x', x(0))
    .attr('y', d => y(d.category)!)
    .attr('width', 0)
    .attr('height', y.bandwidth())
    .attr('fill', '#6366f1')
    .attr('rx', 4);

  // Animation
  bars.transition()
    .duration(800)
    .attr('width', d => x(d.searchVolume));

  // Values labels
  svg.selectAll('.label')
    .data(props.data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.searchVolume) + 5)
    .attr('y', d => y(d.category)! + y.bandwidth() / 2 + 5)
    .text(d => d.searchVolume.toLocaleString())
    .style('font-size', '10px')
    .style('font-weight', 'bold')
    .style('fill', '#1e293b');
};

onMounted(() => {
  drawChart();
  window.addEventListener('resize', drawChart);
});

watch(() => props.data, drawChart, { deep: true });
</script>

<template>
  <div ref="chartRef" class="w-full h-[400px]"></div>
</template>
