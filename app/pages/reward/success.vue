<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-card">
        <!-- 성공 -->
        <div class="success-content">
          <h2 class="congratulation-name">축하합니다 {{ name }} 님 🎉</h2>

          <!-- 이번 QR로 획득한 포인트, 총점, 등수 -->
          <p class="points">{{ qrrank }}등 상품 - {{ points.toLocaleString() }} P 획득!</p>
          <!-- 총점/등수 -->
          <p class="points-sub">몇점 모았지? 💸 {{ total.toLocaleString() }} P</p>
          <p class="points-sub">내 등수는? 🤔 {{ pointRank === null ? '등수없음' : `${pointRank}위` }}</p>
        </div>

        <!-- 인트로 / 로딩 / 에러 때 버튼 숨기기 -->
        <div class="button-group">
          <button class="nav-btn" @click="goToMyList">내 포인트 내역 보기</button>
          <button class="nav-btn" @click="goToRankList">전체 순위 보기</button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
// URL 쿼리 스트링에서 ?qrKey= 값 있으면 꺼내 쓰되, 없으면 세션 스토리지에 저장된 qrKey 꺼내기
const qrKey = computed(() => route.query.qrKey || "")
const cacheKey = computed(() => `reward:${qrKey.value}`)

// 서버 응답 데이터
const name = ref<string>('')
const points = ref<number>(0)
const total = ref<number>(0)
const pointRank = ref<number | null>(null)
const qrrank = ref<number | null>(null)

// myList.vue 이동
const goToMyList = () => {
  router.push({
    path: "/myList",
    query: {
      recentPoint: points.value,
      recentRank: qrrank.value,
      recentDate: new Date().toISOString()
    }
  })
}

// rankList.vue 이동
const goToRankList = () => {
  router.push("/rankList")
}

// 로컬스토리지에서 데이터 불러오기
const loadData = () => {
  const result = localStorage.getItem(cacheKey.value)
  console.log("result: ", result)
  if (result) {
    const d = JSON.parse(result)
    name.value = d.name ?? ''
    points.value = Number(d.points ?? 0)
    total.value = Number(d.total ?? 0)
    pointRank.value = d.pointRank ?? null
    qrrank.value = d.qrrank ?? null

    return
  }
}

watch(
    () => route.query.qrKey,
    (newKey: string) => {
      if(!newKey) {
        qrKey.value = ""
        navigateTo('/reward')
      }
    }
)

// 마운트 시 캐시 우선
onMounted(async () => {
  if (!qrKey.value) {
    navigateTo('/reward')
  }

  // 1) 뒤로가기 복귀면: 인트로 스킵 + 서버 재호출 금지
  // skip && 현재 페이지의 qrKey != 새롭게 입력된 qrKey
  const skip = localStorage.getItem('skipRewardIntro') === '1'
  if (skip) {
    localStorage.removeItem('skipRewardIntro')
  }

  // 3) 정상 유입:
  loadData()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100svh - 5.8rem);
  background-color: #f5f5f5;
}
.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 8.8rem);
  padding: 2rem 1rem;
}

.content-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.4s ease;
}
.status-message { font-size: 1.1rem; color: #666; }
.error-message { font-size: 1.1rem; color: #111827; white-space: pre-wrap; }
.success-content { display: flex; flex-direction: column; gap: 1rem; }
.congratulation-name { font-size: 1.35rem; font-weight: bold; color: #111827; margin: 0; }
.points { font-size: 1.4rem; font-weight: bold; color: #2563eb; margin: 0; margin-bottom: 1rem;}
.points-sub { font-size: 1rem; font-weight: 500; margin: 0; color: #374151;}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 버튼 css */
.button-group {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  gap: 0.8rem;
  align-items: stretch;
}

.nav-btn {
  padding: 0.8rem 1rem;
  background-color: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  width: 100%;
}

.nav-btn:hover {
  background-color: #1d4ed8;
}


/* 인트로 스타일 */
.intro { display:flex; flex-direction:column; align-items:center; gap:1rem; }
.intro-gif { width:220px; height:auto; }
.intro-text { font-size:1.1rem; color:#374151; }

</style>
