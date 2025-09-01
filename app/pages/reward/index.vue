<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-card">

        <!-- 로딩 -->
        <div v-if="isLoading" class="status-message">확인 중…</div>

        <!-- 에러 -->
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <!-- 성공 -->
        <div v-else class="success-content">
          <h2 class="congratulation-name">축하합니다 {{ name }} 님 🎉</h2>

          <!-- 이번 QR로 획득한 포인트, 총점, 등수 -->
          <p class="points">{{ qrrank }}등 상품 - {{ points.toLocaleString() }} P 획득!</p>
          <!-- 총점/등수 -->
          <p class="points-sub">몇점 모았지? 💸 {{ total.toLocaleString() }} P</p>
          <p class="points-sub">내 등수는? 🤔 {{ pointRank === null ? '등수없음' : `${pointRank}위` }}</p>
        </div>

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
const qrKey = computed(() =>
    String(route.query.qrKey ?? sessionStorage.getItem('qrKey') ?? '')
)
const router = useRouter()

const cacheKey = computed(() => `reward:${qrKey.value}`)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// 서버 응답 데이터
const name = ref<string>('')
const points = ref<number>(0)
const total = ref<number>(0)
const pointRank = ref<number | null>(null)
const qrrank = ref<number | null>(null)

// fetcher
const { VITE_BASE_URL } = import.meta.env
const api = $fetch.create({
  baseURL: VITE_BASE_URL,
  onRequest({ options }) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      options.headers = new Headers(options.headers || {})
      options.headers.set('Authorization', `Bearer ${token}`)
    }
  }
})

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

/* 데이터 로드 */
async function loadData() {
  if (isLoading.value) return

  try {
    isLoading.value = true
    errorMessage.value = null

    if (!qrKey.value) {
      errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
      return
    }

    // 1) QR 결과
    const res1: any = await api('/api/users/qr', {
      method: 'POST',
      body: { qrKey: qrKey.value }
    })

    console.log("res1:", res1)

    // 실패 처리
    if (!res1?.ok) {
      errorMessage.value = res1?.memo || '유효하지 않은 코드입니다.'
      return
    }

    // 성공 처리
    points.value = Number(res1?.points ?? 0)
    name.value = String(res1?.name ?? '').trim()
    qrrank.value = res1?.qrrank ?? null
    total.value = Number(res1?.total ?? 0)
    pointRank.value = res1?.pointRank ?? null

    // 성공 시 캐시 저장
    sessionStorage.setItem(cacheKey.value, JSON.stringify({
      name: name.value,
      points: points.value,
      total: total.value,
      pointRank: pointRank.value,
      qrrank: qrrank.value,
    }))

  } catch (e: any) {
    if (e?.status === 401) {
      localStorage.removeItem("accessToken")
      sessionStorage.clear()
      return navigateTo(`/?qrKey=${encodeURIComponent(qrKey.value)}`, { replace: true })
    }
    errorMessage.value = e?.data?.message || e?.message || '데이터를 불러오는 중 문제가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}


// 마운트 시 캐시 우선
onMounted(() => {
  try {
    const raw = sessionStorage.getItem(cacheKey.value)
    if (raw) {
      const d = JSON.parse(raw)
      name.value = d.name ?? ''
      points.value = Number(d.points ?? 0)
      total.value = Number(d.total ?? 0)
      pointRank.value = d.pointRank ?? null
      qrrank.value = d.qrrank ?? null
      return
    }
  } catch {}
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

</style>
