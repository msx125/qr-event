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

        <!-- 성공 -->
        <div v-else class="success-content">
          <h2 class="congratulation-name">축하합니다 {{ name }} 님 🎉</h2>

          <!-- 이번 QR로 획득한 포인트, 총점, 등수 -->
          <p class="points">{{ qrrank }}등 상품 - {{ points.toLocaleString() }} P 획득!</p>
          <!-- 총점/등수 -->
          <p class="points-sub">몇점 모았지? 💸 {{ total.toLocaleString() }} P</p>
          <p class="points-sub">내 등수는? 🤔 {{ pointRank === null ? '등수없음' : `${pointRank}위` }}</p>
        </div>

        <!-- 인트로 / 로딩 / 에러 때 버튼 숨기기 -->
        <div class="button-group" v-if="!isIntro && !isLoading">
          <button class="nav-btn" @click="goToMyList">내 포인트 내역 보기</button>
          <button class="nav-btn" @click="goToRankList">전체 순위 보기</button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const qrKey = computed(() => String(route.query.qrKey ?? ''))
const router = useRouter()

const cacheKey = computed(() => `reward:${qrKey.value}`)

// 인트로(GIF)용 상태
const isIntro = ref(false)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// qr 없음 상태 플래그 추가
const isQrMissing = ref(false)

// 서버 응답 데이터
const name = ref<string>('')
const points = ref<number>(0)
const total = ref<number>(0)
const pointRank = ref<number | null>(null)
const qrrank = ref<number | null>(null)
const api = useFetcher()

// 새로고침 감지해서 gif 안띄우기 용도
const isReload =
    typeof window !== 'undefined' &&
    (
        performance?.getEntriesByType?.('navigation')?.[0]?.type === 'reload' ||
        (performance as any)?.navigation?.type === 1 // 폴백
    )

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

    const qrError =
        // 서버가 ok=false를 줄 수도 있음
        res1?.ok === false ||
        // 서버가 200으로 주지만 status 필드로 오류를 알림 (404.1 등)
        (typeof res1?.status !== 'undefined' && Number(res1.status) >= 400) ||
        // memo만 있고 정상 데이터 없음
        (!!res1?.memo && !('points' in res1))

    if (qrError) {
      // 기존 성공 캐시가 있으면 지워서 0P 같은 잔상 방지
      try { sessionStorage.removeItem(cacheKey.value) } catch {}
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
onMounted(async () => {

  if (isReload) {
    if (!qrKey.value) {
      // qrKey 없으면 안내만
      isIntro.value = false
      isLoading.value = false
      isQrMissing.value = true
      errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
      return
    }
    // qrKey 있으면 인트로 없이 바로 요청
    isIntro.value = false
    await loadData()
    return
  }

  // 0) qrKey가 아예 없으면: 인트로/로딩 off + 에러 메시지 + 버튼 보이기
  if (!qrKey.value) {
    isIntro.value = false
    isLoading.value = false
    isQrMissing.value = true          // ← 버튼 노출 조건에 씀
    errorMessage.value = 'QR 코드를 새롭게 찍어주세요 📷'
    return
  }

  // 1) 캐시 먼저 반영(있으면 즉시 표시)
  try {
    const raw = sessionStorage.getItem(cacheKey.value)
    if (raw) {
      const d = JSON.parse(raw)
      name.value = d.name ?? ''
      points.value = Number(d.points ?? 0)
      total.value = Number(d.total ?? 0)
      pointRank.value = d.pointRank ?? null
      qrrank.value = d.qrrank ?? null
    }
  } catch {}

  // 2) 뒤로가기 복귀면: 인트로 스킵 + 서버 재호출 금지
  const skip = sessionStorage.getItem('skipRewardIntro') === '1'
  if (skip) {
    sessionStorage.removeItem('skipRewardIntro')
    isIntro.value = false
    isLoading.value = false
    return
  }

  // 3) 정상 유입: 인트로 2초 + 서버 호출 병렬
  isIntro.value = true
  const timer = new Promise<void>((res) => setTimeout(res, 2000))
  const data = loadData()
  await Promise.allSettled([timer, data])
  isIntro.value = false
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
