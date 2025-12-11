<template>
  <div class="color-card" :style="{ backgroundColor: color }">
    <div class="color-actions">
      <button @click="$emit('toggle-lock')" class="icon-btn" :class="{ locked: isLocked }">
        {{ isLocked ? '🔒' : '🔓' }}
      </button>
      <button @click="copyToClipboard" class="icon-btn">
        📋
      </button>
    </div>
    
    <div class="color-info" :style="{ color: textColor }">
      <span class="hex-code">{{ color }}</span>
      <span v-if="showRgb" class="rgb-code">{{ rgbString }}</span>
      
      <div class="wcag-badge" :title="`Контраст: ${contrastRatio}:1`">
        WCAG: {{ wcagRating }}
      </div>
    </div>
    
    <div v-if="copied" class="toast">Скопировано!</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { hexToRgb, getContrastRatio, getAccessibilityLevel } from '../utils/colorUtils'

const props = defineProps({
  color: String,
  isLocked: Boolean,
  showRgb: Boolean
})

const emit = defineEmits(['toggle-lock'])
const copied = ref(false)

// Определяем цвет текста (черный или белый) для читаемости
const textColor = computed(() => {
  return getContrastRatio(props.color, '#000000') > 4.5 ? '#000000' : '#FFFFFF'
})

// Строка RGB
const rgbString = computed(() => {
  const {r, g, b} = hexToRgb(props.color)
  return `rgb(${r}, ${g}, ${b})`
})

// Расчет коэффициента контраста
const contrastRatio = computed(() => {
  return getContrastRatio(props.color, textColor.value).toFixed(2)
})

// Получение текстового рейтинга (AAA, AA...)
const wcagRating = computed(() => {
  return getAccessibilityLevel(Number(contrastRatio.value))
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.color)
    copied.value = true
    setTimeout(() => copied.value = false, 1500)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}
</script>

<style scoped>
.color-card {
  height: 300px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.color-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.15);
  z-index: 1;
}

.color-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.color-card:hover .color-actions {
  opacity: 1;
}

.icon-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.4);
}

.icon-btn.locked {
  background: rgba(255,255,255,0.8);
}

.color-info {
  text-align: center;
  font-family: monospace;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hex-code {
  font-size: 1.2rem;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.rgb-code {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.wcag-badge {
  font-size: 0.7rem;
  border: 1px solid currentColor;
  padding: 2px 8px;
  border-radius: 12px;
  opacity: 0.7;
  margin-top: 4px;
  cursor: help;
}

.toast {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  pointer-events: none;
}
</style>