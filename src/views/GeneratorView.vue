<template>
  <div class="generator">
    
    <div class="top-section">
      <div class="controls-wrapper">
        <div class="controls">
          <div class="control-group">
            <label>Режим:</label>
            <select v-model="settings.mode">
              <optgroup label="Гармонии">
                <option value="random">Случайный</option>
                <option value="analogous">Аналогичная</option>
                <option value="monochromatic">Монохромная</option>
                <option value="triad">Триада</option>
                <option value="complementary">Комплементарная</option>
              </optgroup>
              <optgroup label="Настроение">
                <option value="calm">Спокойное 🍃</option>
                <option value="energetic">Энергичное ⚡</option>
                <option value="professional">Строгое 👔</option>
              </optgroup>
            </select>
          </div>

          <div class="control-group">
            <label>Кол-во:</label>
            <select v-model="settings.count">
              <option :value="3">3 цвета</option>
              <option :value="5">5 цветов</option>
              <option :value="7">7 цветов</option>
            </select>
          </div>

          <div class="control-group" v-if="!['random', 'calm', 'energetic', 'professional'].includes(settings.mode)">
            <label>База:</label>
            <input type="color" v-model="settings.baseColor">
          </div>

          <button @click="generatePalette" class="btn-generate">
            🔄 Генерировать (Space)
          </button>
        </div>
      </div>

      <div class="wheel-wrapper">
         <ColorWheel :colors="palette.map(c => c.hex)" />
      </div>
    </div>

    <div class="palette-grid" :style="{ gridTemplateColumns: `repeat(${settings.count}, 1fr)` }">
      <ColorCard 
        v-for="(color, index) in palette" 
        :key="index"
        :color="color.hex"
        :isLocked="color.isLocked"
        :showRgb="settings.showRgb"
        @toggle-lock="toggleLock(index)"
      />
    </div>

    <div class="tools-panel">
      <div class="toggles">
        <label>
          <input type="checkbox" v-model="settings.showRgb"> Показать RGB
        </label>
      </div>
      
      <div class="actions">
        <button @click="savePalette" class="btn secondary">💾 В библиотеку</button>
        <button @click="openExportModal" class="btn secondary">📤 Экспорт</button>
      </div>
    </div>

    <div v-if="showExport" class="modal-backdrop" @click.self="showExport = false">
      <div class="modal-content">
        <h3>Экспорт палитры</h3>
        
        <div class="tabs">
          <button @click="exportFormat = 'css'" :class="{ active: exportFormat === 'css' }">CSS</button>
          <button @click="exportFormat = 'scss'" :class="{ active: exportFormat === 'scss' }">SCSS</button>
          <button @click="exportFormat = 'tailwind'" :class="{ active: exportFormat === 'tailwind' }">Tailwind</button>
          <button @click="exportFormat = 'json'" :class="{ active: exportFormat === 'json' }">JSON</button>
        </div>

        <textarea readonly :value="exportContent"></textarea>
        
        <div class="modal-actions">
          <button @click="copyExportCode" class="btn-copy">Копировать код</button>
          <button @click="showExport = false" class="btn-close">Закрыть</button>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h3>Превью интерфейса</h3>
      <div class="mockup" :style="{ backgroundColor: palette[0]?.hex || '#eee' }">
        <div class="mockup-card" :style="{ backgroundColor: palette[1]?.hex || '#fff' }">
          <h4 :style="{ color: palette[settings.count - 1]?.hex }">Заголовок</h4>
          <p :style="{ color: palette[2]?.hex }">
            Тестирование контрастности и гармонии цветов в реальном интерфейсе.
          </p>
          <button :style="{ backgroundColor: palette[settings.count - 2]?.hex, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }">
            Действие
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import ColorCard from '../components/ColorCard.vue'
import ColorWheel from '../components/ColorWheel.vue'
import { generateRandomHex, generateHarmony } from '../utils/colorUtils'

// Состояние
const palette = ref([])
const showExport = ref(false)
const exportFormat = ref('css')

const settings = reactive({
  mode: 'random',
  count: 5,
  showRgb: false,
  baseColor: '#6366F1'
})

// === Генерация ===
const generatePalette = () => {
  const newColors = []
  
  // Получаем массив цветов гармонии или настроения
  let generatedColors = []
  if (settings.mode !== 'random') {
    generatedColors = generateHarmony(settings.baseColor, settings.mode, settings.count)
  }

  for (let i = 0; i < settings.count; i++) {
    // Если цвет заблокирован, оставляем старый
    if (palette.value[i]?.isLocked) {
      newColors.push(palette.value[i])
      continue
    }

    let hexColor
    if (settings.mode === 'random') {
      hexColor = generateRandomHex()
    } else {
      // Берем из массива, либо генерируем случайный если массив кончился
      hexColor = generatedColors[i] || generateRandomHex()
    }

    newColors.push({
      hex: hexColor,
      isLocked: false
    })
  }
  
  palette.value = newColors.slice(0, settings.count)
}

const toggleLock = (index) => {
  palette.value[index].isLocked = !palette.value[index].isLocked
}

// === Сохранение ===
const savePalette = () => {
  const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]')
  saved.push({
    id: Date.now(),
    date: new Date().toISOString(),
    colors: palette.value.map(c => c.hex),
    name: `Палитра #${saved.length + 1}`
  })
  localStorage.setItem('savedPalettes', JSON.stringify(saved))
  alert('Палитра сохранена в библиотеку!')
}

// === Экспорт ===
const openExportModal = () => {
  showExport.value = true
}

const exportContent = computed(() => {
  const colors = palette.value.map(c => c.hex)
  
  switch (exportFormat.value) {
    case 'css':
      return `:root {\n` + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + `\n}`
    case 'scss':
      return colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n')
    case 'tailwind':
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` + 
             colors.map((c, i) => `        'brand-${i + 1}': '${c}',`).join('\n') + 
             `\n      }\n    }\n  }\n}`
    case 'json':
      return JSON.stringify(colors, null, 2)
    default:
      return ''
  }
})

const copyExportCode = () => {
  navigator.clipboard.writeText(exportContent.value)
  alert('Код скопирован!')
}

// === Lifecycle & Watchers ===
const handleKeydown = (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault()
    generatePalette()
  }
}

watch([palette, settings], () => {
  localStorage.setItem('currentWorkspace', JSON.stringify({
    palette: palette.value,
    settings: settings
  }))
}, { deep: true })

onMounted(() => {
  const savedWorkspace = localStorage.getItem('currentWorkspace')
  if (savedWorkspace) {
    try {
      const parsed = JSON.parse(savedWorkspace)
      // Восстанавливаем, но проверяем длину массива на случай изменения настроек
      if(parsed.palette && parsed.palette.length > 0) {
          palette.value = parsed.palette
          Object.assign(settings, parsed.settings)
      } else {
          generatePalette()
      }
    } catch(e) {
       generatePalette()
    }
  } else {
    generatePalette()
  }
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.generator {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  align-items: center;
}

.controls-wrapper {
  flex: 2;
  min-width: 300px;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-group label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

select, input[type="color"] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 40px;
}

.btn-generate {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 0 1.5rem;
  height: 40px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  transition: opacity 0.2s;
}

.btn-generate:hover {
  opacity: 0.9;
}

.wheel-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 150px;
}

.palette-grid {
  display: grid;
  gap: 1rem;
  min-height: 300px;
}

.tools-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
}

.btn.secondary {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-left: 10px;
  cursor: pointer;
}

.btn.secondary:hover {
  background: #f8fafc;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: #f1f5f9;
  border-radius: 4px;
  cursor: pointer;
}

.tabs button.active {
  background: #6366f1;
  color: white;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  margin-bottom: 1rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-copy {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-close {
  background: transparent;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.preview-section {
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
}

.mockup {
  padding: 3rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mockup-card {
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>