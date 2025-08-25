<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-card">

        <div v-if="isLoading" class="status-message">확인 중…</div>

        <!-- 서버에서 qr 상태에 대한 응답 key memo 보여주기 -->
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div v-else class="success-content">
          <h2 class="congratulation-name">축하합니다 {{ memName }} 님 🎉 </h2>

          <!-- 이번 QR로 획득한 포인트 -->
          <p class="points">로또 {{qrrank}} 등  - {{ gainedPoint.toLocaleString() }} P 획득!</p>

          <!-- 총점/등수 (없으면 — 표기) -->
          <p class="points-sub">총 포인트는? 💸  {{ totalPoint === null ? '0점' : totalPoint.toLocaleString() }} P</p>
          <p class="points-sub">내 포인트 순위는? 🤔 {{ rank === null ? '등수없음' : `${rank}위` }}</p>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const qrKey = computed(() => String(route.query.qrKey ?? ''))

// 새로고침 시 화면 날라가는 것 방지 위한 qr별 캐시키
const cacheKey = computed(() => `reward:${qrKey.value}`)


const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

/* 화면에 쓸 변수 (요청하신 대로 변수로 제공) */
const memName = ref<string>('')
const gainedPoint = ref<number>(0)
const totalPoint = ref<number | null>(null)
const rank = ref<number | null>(null)

// 로또 등수
const qrrank = ref<number | null>(null)


// fetcher 로 빼기
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

/* 데이터 로드 (단순 흐름) */
async function loadData() {

  // 이미 로딩중이면 종료되어서 2번 호출 안되도록 방어 시도 25.08.25
  if(isLoading.value) return

  try {
    isLoading.value = true
    errorMessage.value = null

    if (!qrKey.value) {
      errorMessage.value = 'QR 코드가 유효하지 않습니다.'
      return
    }

    // 1) QR 결과
    const res1: any = await api('/api/users/qr', {
      method: 'POST',
      body: { qrKey: qrKey.value }
    })

    console.log("res1:", res1)

    // ok:false면 memo 그대로 에러로 표시
    if (!res1?.ok) {
      errorMessage.value = res1?.memo || '유효하지 않은 코드입니다.'
      return
    }

    // 정상 처리
    gainedPoint.value = Number(res1?.points ?? 0)
    memName.value = String(res1?.name ?? '').trim()
    qrrank.value = res1?.qrrank ?? null


    // 2) 랭킹/총점 (GET, 파라미터 없음)
    const res2: any = await api('/api/users/rank', { method: 'GET' })

    console.log("res2:", res2)

    const list = Array.isArray(res2?.content) ? res2.content : []
    const offset =
        typeof res2?.pageable?.offset === 'number'
            ? res2.pageable.offset
            : 0

    const idx = list.findIndex((item: any) => item?.memName === memName.value)

    if (idx >= 0) {
      totalPoint.value = Number(list[idx].totalPoint ?? 0)
      rank.value = offset + idx + 1
    } else {
      totalPoint.value = null
      rank.value = null
    }

    // 성공 시 화면 데이터 그대로 캐시 (세션 스토리지) - 처음 한번만 서버 요청 후 캐시 저장
    sessionStorage.setItem(cacheKey.value, JSON.stringify({
    memName: memName.value,
    gainedPoint: gainedPoint.value,
    totalPoint: totalPoint.value,
    rank: rank.value,
    qrrank: qrrank.value,
    }))

  } catch (e: any) {
    if (e?.status === 401) {
    return navigateTo(`/?qrKey=${encodeURIComponent(qrKey.value)}`, { replace: true })
    }

    errorMessage.value =
        e?.data?.message ||
        e?.message ||
        '데이터를 불러오는 중 문제가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 컴포넌트가 DOM에 마운트될 때 자동으로 실행되는 함수
onMounted(() => {

    // 마운트 시 캐시 먼저 시도하도록 함
  try {
    const raw = sessionStorage.getItem(cacheKey.value)
    if (raw) {
      const d = JSON.parse(raw)
      memName.value = d.memName ?? ''
      gainedPoint.value = Number(d.gainedPoint ?? 0)
      totalPoint.value = d.totalPoint ?? null
      rank.value = d.rank ?? null
      qrrank.value = d.qrrank ?? null
      return
      }
    // 마운트 시 캐시 먼저 시도하도록 함
  } catch {}
  loadData()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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
.status-message { font-size: 1.1rem; color: #666; }
.error-message { font-size: 1.1rem; color: #dc2626; white-space: pre-wrap; }
.success-content { display: flex; flex-direction: column; gap: 1rem; }
.congratulation-name { font-size: 1.4rem; color: #333; margin: 0; }
.points { font-size: 1.5rem; font-weight: bold; color: #2563eb; margin: 0; }

.points-sub { font-size: 1rem; font-weight: bold; margin: 0; }
</style>
