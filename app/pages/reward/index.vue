<script setup lang="ts">
const route = useRoute()
// URL 쿼리 스트링에서 ?qrKey= 값 있으면 꺼내 쓰되, 없으면 세션 스토리지에 저장된 qrKey 꺼내기
const qrKey = computed(() => route.query.qrKey || "")
const router = useRouter()
const cacheKey = computed(() => `reward:${qrKey.value}`)

// 인트로(GIF)용 상태
const isIntro = ref(false) // 인트로 gif 보여줄지 여부
const isLoading = ref(false) // 서버 응답 여부 (로딩)
const errorMessage = ref<string | null>(null) // 에러 메세지

// qr 없음 상태 플래그 추가
const isQrMissing = ref(false)

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
  if (!qrKey.value) {
    errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = null

    // 1) QR 결과
    const res1: any = await api('/api/users/qr', {
      method: 'POST',
      body: { qrKey: qrKey.value }
    })

    // 실패 처리
    if (res1.status != 200) {
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
    localStorage.setItem(cacheKey.value, JSON.stringify({
      name: name.value,
      points: points.value,
      total: total.value,
      pointRank: pointRank.value,
      qrrank: qrrank.value,
    }))

    isIntro.value = true
    const timer = new Promise<void>((res) => setTimeout(res, 2000))
    await Promise.allSettled([timer])
    isIntro.value = false
    navigateTo(`/reward/success?qrKey=${qrKey.value}`)

  } catch (e: any) {
    if (e?.status === 401) {
      localStorage.removeItem("accessToken")
      localStorage.clear()
      return navigateTo(`/?qrKey=${encodeURIComponent(qrKey.value)}`, { replace: true })
    }
    errorMessage.value = e?.data?.message || e?.message || '데이터를 불러오는 중 문제가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

watch(
    () => route.query.qrKey,
    (newKey: string) => {
      if(!newKey) {
        qrKey.value = ""
        errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
      }
    }
)

// 마운트 시 캐시 우선
onMounted(async () => {
  // 0) qrKey가 아예 없으면: 인트로/로딩 off + 에러 메시지 + 버튼 보이기
  if (!qrKey.value) {
    isIntro.value = false
    isLoading.value = false
    isQrMissing.value = true          // ← 버튼 노출 조건에 씀
    errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
    localStorage.removeItem('skipRewardIntro')
    return
  }

  // 3) 정상 유입: 인트로 2초 + 서버 호출 병렬
  await loadData()

})
</script>

<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-card">


        <!-- 인트로 GIF -->
        <div v-if="isIntro" class="intro">
          <img src="/1.gif" alt="추첨 중…" class="intro-gif" />
          <p class="intro-text">추첨 중… 🎰</p>
        </div>
        <!-- 인트로 GIF -->

        <!-- 로딩 --> <!-- 인트로 보일 땐 로딩 / 에러 / 성공 안보이도록 v-else-if 수정 -->
        <div v-else-if="isLoading" class="status-message">확인 중…</div>

        <!-- 에러 -->
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <!-- 인트로 / 로딩 / 에러 때 버튼 숨기기 -->
        <div class="button-group" v-if="!isIntro && !isLoading">
          <button class="nav-btn" @click="goToMyList">내 포인트 내역 보기</button>
          <button class="nav-btn" @click="goToRankList">전체 순위 보기</button>
        </div>

      </div>
    </main>
  </div>
</template>

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
