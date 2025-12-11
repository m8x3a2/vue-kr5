<template>
  <header>
    <div class="logo">🎨 PaletteGen</div>
    <nav>
      <RouterLink to="/">Генератор</RouterLink>
      <RouterLink to="/library">Библиотека</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
/* Базовые стили */
:root {
  --primary: #6366f1;
  --bg: #f8fafc;
  --text: #1e293b;
}

body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background-color: var(--bg);
  color: var(--text);
}

header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--primary);
}

nav a {
  margin-left: 20px;
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
}

nav a.router-link-active {
  color: var(--primary);
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>