<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-card">

        <div v-if="isLoading" class="status-message">확인 중…</div>

        <!-- 서버 memo를 그대로 보여줍니다 -->
<!--        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>-->

        <div v-else class="success-content">
          <h2 class="congratulation-name">축하드립니다 {{ memName }} 님</h2>

          <!-- 이번 QR로 획득한 포인트 -->
          <p class="points">{{ gainedPoint.toLocaleString() }} P 획득</p>

          <!-- 총점/등수 (없으면 — 표기) -->
          <p class="points-sub">얼마 모았지?  {{ totalPoint === null ? '—' : totalPoint.toLocaleString() }}</p>
          <p class="points-sub">난 지금 몇등?  {{ rank === null ? '—' : `${rank}위` }}</p>
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

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

/* 화면에 쓸 변수 (요청하신 대로 변수로 제공) */
const memName = ref<string>('')
const gainedPoint = ref<number>(0)
const totalPoint = ref<number | null>(null)
const rank = ref<number | null>(null)

/* API 클라이언트 (기존 방식 유지) */
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
  } catch (e: any) {
    errorMessage.value =
        e?.data?.message ||
        e?.message ||
        '데이터를 불러오는 중 문제가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
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
.congratulation-name { font-size: 1.5rem; color: #333; margin: 0; }
.points { font-size: 1.5rem; font-weight: bold; color: #2563eb; margin: 0; }

.points-sub { font-size: 1rem; font-weight: bold; color: #2563eb; margin: 0; }
</style>
