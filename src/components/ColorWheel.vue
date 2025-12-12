<template>
  <div class="color-wheel-container">
    <svg viewBox="0 0 100 100" class="wheel-svg">
      <defs>
        <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff0000" />
          <stop offset="16%" stop-color="#ff00ff" />
          <stop offset="33%" stop-color="#0000ff" />
          <stop offset="50%" stop-color="#00ffff" />
          <stop offset="66%" stop-color="#00ff00" />
          <stop offset="83%" stop-color="#ffff00" />
          <stop offset="100%" stop-color="#ff0000" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" stroke="url(#wheelGradient)" stroke-width="5" fill="none" opacity="0.5" />
      
      <circle 
        v-for="(pos, index) in colorPositions" 
        :key="index"
        :cx="pos.x" 
        :cy="pos.y" 
        r="3" 
        :fill="pos.color"
        stroke="#fff"
        stroke-width="1"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { hexToRgb, rgbToHsl } from '../utils/colorUtils'

const props = defineProps({
  colors: {
    type: Array,
    default: () => []
  }
})

const colorPositions = computed(() => {
  return props.colors.map(hex => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    
    // Преобразование Hue (0-360) в координаты на круге
    // Сдвигаем на -90 градусов, чтобы 0 (красный) был сверху, или оставляем как есть
    const angleInRadians = (hsl.h) * (Math.PI / 180)
    const radius = 45 // Радиус круга SVG
    const centerX = 50
    const centerY = 50
    
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
      color: hex
    }
  })
})
</script>

<style scoped>
.color-wheel-container {
  width: 150px;
  height: 150px;
  margin: 0 auto;
}
.wheel-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* Чтобы красный начинался сверху */
}
</style>