<template>
  <div class="page-container">
    <!-- GNB -->
    <nav class="gnb">
      <div class="gnb-content">
        <h1 class="logo">IDEVEL</h1>
        <div class="nav-links">
          <a href="/login" class="nav-link">로그인</a>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-card">
        <div v-if="pending" class="status-message">확인 중…</div>
        <div v-else-if="error" class="error-message">유효하지 않은 코드입니다.</div>
        <div v-else class="success-content">
          <h2 class="title">당첨 금액</h2>
          <p class="amount">10,000원</p>
          <p class="congratulations">축하드립니다! 당첨금을 확인해 주세요!</p>
          <small class="code-display">코드: {{ code }}</small>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const code = computed(() => (route.query.code ?? '').toString());

// 예: 서버 검증
const { data, pending, error } = await useFetch('users/qr', {
  query: { code }
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

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

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2rem 1rem;
}

.content-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.status-message {
  font-size: 1.1rem;
  color: #666;
}

.error-message {
  font-size: 1.1rem;
  color: #dc2626;
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.congratulations {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.code-display {
  color: #999;
  font-size: 0.8rem;
  margin-top: 1rem;
}
</style>