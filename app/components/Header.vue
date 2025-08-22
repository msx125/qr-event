<template>
  <nav class="gnb">
    <div class="gnb-content">
      <NuxtLink class="logo" to="/">IDEVEL</NuxtLink>
      <div class="nav-links">
        <a href="/login" class="nav-link">로그인</a>
      </div>
    </div>
  </nav>
</template>


<style scoped>

.gnb {
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 1rem 0;
}

.gnb-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: #333;
}

</style>
<script setup lang="ts">
</script>