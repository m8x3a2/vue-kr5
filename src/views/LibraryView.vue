<template>
  <div class="library">
    <div class="library-header">
      <h2>📚 Мои коллекции</h2>
      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          placeholder="🔍 Поиск по названию..." 
          class="search-input"
        >
      </div>
    </div>
    
    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <div v-if="savedPalettes.length === 0">
        <p>Библиотека пуста.</p>
        <router-link to="/" class="cta-link">Создать первую палитру</router-link>
      </div>
      <div v-else>
        <p>Ничего не найдено по запросу "{{ searchQuery }}"</p>
      </div>
    </div>

    <div v-else class="palettes-list">
      <div v-for="palette in filteredPalettes" :key="palette.id" class="saved-item">
        <div class="palette-header">
          <input 
            v-model="palette.name" 
            @change="updateStorage" 
            class="palette-name-input"
          >
          <button @click="deletePalette(palette.id)" class="btn-delete" title="Удалить">
            🗑️
          </button>
        </div>
        
        <div class="mini-palette">
          <div 
            v-for="color in palette.colors" 
            :key="color" 
            class="color-strip" 
            :style="{ backgroundColor: color }"
            :title="color"
          ></div>
        </div>
        
        <div class="palette-meta">
          <span class="date">{{ new Date(palette.date).toLocaleDateString() }}</span>
          <button @click="loadPalette(palette)" class="btn-load">
            Открыть в редакторе
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const savedPalettes = ref([])
const searchQuery = ref('')

// Инициализация
onMounted(() => {
  const saved = localStorage.getItem('savedPalettes')
  if (saved) {
    try {
      savedPalettes.value = JSON.parse(saved)
    } catch (e) {
      savedPalettes.value = []
    }
  }
})

// Фильтрация для поиска
const filteredPalettes = computed(() => {
  if (!searchQuery.value.trim()) return savedPalettes.value
  
  const query = searchQuery.value.toLowerCase()
  return savedPalettes.value.filter(p => 
    p.name.toLowerCase().includes(query)
  )
})

// Обновление LocalStorage
const updateStorage = () => {
  localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value))
}

const deletePalette = (id) => {
  if(confirm('Вы уверены, что хотите удалить эту палитру?')) {
    savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
    updateStorage()
  }
}

// Загрузка в генератор
const loadPalette = (palette) => {
  // Формируем формат для редактора, блокируя цвета, чтобы они не изменились сразу
  const editorFormat = palette.colors.map(hex => ({ hex, isLocked: true }))
  
  localStorage.setItem('currentWorkspace', JSON.stringify({
    palette: editorFormat,
    settings: { 
      mode: 'random', 
      count: palette.colors.length, 
      showRgb: false, 
      baseColor: palette.colors[0] 
    }
  }))
  
  router.push('/')
}
</script>

<style scoped>
.library {
  max-width: 800px;
  margin: 0 auto;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-input {
  padding: 0.6rem 1rem;
  border-radius: 20px;
  border: 1px solid #ddd;
  width: 250px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #6366f1;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  background: white;
  border-radius: 12px;
}

.cta-link {
  display: inline-block;
  margin-top: 1rem;
  color: #6366f1;
  text-decoration: none;
  font-weight: bold;
}

.palettes-list {
  display: grid;
  gap: 1.5rem;
}

.saved-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.saved-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: center;
}

.palette-name-input {
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-bottom: 1px dashed transparent;
  width: 70%;
  padding: 0.2rem;
  background: transparent;
  transition: border-color 0.2s;
}

.palette-name-input:focus {
  border-bottom-color: #6366f1;
  outline: none;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-delete:hover {
  opacity: 1;
}

.mini-palette {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.color-strip {
  flex: 1;
}

.palette-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.date {
  color: #94a3b8;
}

.btn-load {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-load:hover {
  background: #4f46e5;
}
</style>