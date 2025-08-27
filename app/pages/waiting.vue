<template>
  <div class="waiting-container">
    <h2 class="title">추첨 중… 🎰</h2>
    <p class="subtitle">잠시만 기다려주세요!</p>

    <!-- 🎞️ 애니메이션 영역 (gif / Lottie 가능) -->
    <div class="animation">
      <img alt="추첨 애니메이션" />
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()

onMounted(() => {
  const { qrKey } = route.query

  // qrKey 안전하게 세션 스토리지에 저장
  if (qrKey) {
    sessionStorage.setItem('qrKey', qrKey)
  }

  // 2.5초 후 reward 페이지로 이동
  setTimeout(() => {
    router.push({
      path: '/reward',
      // 세션에 있는 값까지 fallback
      query: { qrKey: qrKey || sessionStorage.getItem('qrKey') }
    })
  }, 2500)
})
</script>

<style scoped>
.waiting-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f9d423, #ff4e50);
  color: white;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
}

.title {
  font-size: 2rem;
  font-weight: bold;
}

.subtitle {
  margin-top: 0.5rem;
  font-size: 1.2rem;
}

.animation {
  margin-top: 2rem;
}

.animation img {
  width: 200px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
</style>
