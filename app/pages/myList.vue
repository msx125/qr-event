<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-wrapper">
        <div class="ranking-section">
          <h2 class="section-title">내 포인트 히스토리</h2>

          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="status-message">
            데이터를 불러오는 중...
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- 히스토리 리스트 -->
          <div v-else class="ranking-container">
            <div class="ranking-card">
              <div class="ranking-header">
                <span class="header-item">No.</span>
                <span class="header-item">상품 포인트</span>
                <span class="header-item">상품 등수</span>
                <span class="header-item">사용 시간</span>
              </div>

              <div class="ranking-list">
                <div
                    v-for="(item, index) in rankingList"
                    :key="index"
                    class="ranking-item"
                >
                  <span class="rank-number">{{ index + 1 }}</span>
                  <span class="prize-amount">{{ Number(item.qrPoint || 0).toLocaleString() }}</span>
                  <span class="qr-rank">{{ item.qrRank }}</span>
                  <span class="register-date">{{ formatDate(item.registeredAt) }}</span>
                </div>
              </div>

              <!-- 누적 합계 -->
              <div class="total-section">
                <p class="total-text">
                  총 포인트 : {{ totalPrize.toLocaleString() }} P
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 뒤로가기 버튼 -->
        <div class="back-btn-wrapper">
          <button class="back-btn" @click="goBack">뒤로가기</button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
const router = useRouter()

const isLoading = ref(true)
const errorMessage = ref("")
const rankingList = ref([])
const totalPrize = ref(0)

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ""

  const date = new Date(dateString)

  const month = date.getMonth() + 1  // 8
  const day = date.getDate()         // 29

  let hour = date.getHours()
  const ampm = hour >= 12 ? "오후" : "오전"
  hour = hour % 12
  if (hour === 0) hour = 12

  const minute = date.getMinutes().toString().padStart(2, "0")

  return `${month}/${day} ${ampm} ${hour}:${minute}`
}

// 히스토리 스택 유지한채로 뒤로가기 ( 이전 화면 그대로 가지고 있도록 )
// 다음 reward 진입 시 인트로 스킵
const goBack = () => {
  localStorage.setItem('skipRewardIntro', '1')
  router.back()
}

// fetcher 세팅
const { VITE_BASE_URL } = import.meta.env
const api = $fetch.create({
  baseURL: VITE_BASE_URL,
  onRequest({ options }) {
    const token = localStorage.getItem("accessToken")
    console.log("액세스 토큰:", token)
    if (token) {
      options.headers = new Headers(options.headers || {})
      options.headers.set("Authorization", `Bearer ${token}`)
    }
  },
})

// 데이터 로드
const loadRankingData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ""

    const res = await api("/api/users/qrhistory", { method: "GET" })
    console.log("/api/users/qrhistory 응답값 체크: ", res)

    if (res?.data && Array.isArray(res.data)) {
      rankingList.value = res.data.map((it) => ({
        registeredAt: it.REGISTERED_AT,
        qrPoint: Number(it.QR_POINT) || 0,
        qrRank: it.QR_RANKING,
      }))

      totalPrize.value = res.totalPoint;

    } else if (res?.result) {
      errorMessage.value = res.result
      rankingList.value = []
      totalPrize.value = 0
    } else {
      errorMessage.value = "알 수 없는 응답 형식입니다."
    }
  } catch (err) {
    console.error("API 에러:", err)
    errorMessage.value = "데이터 불러오기 실패"
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRankingData()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 20.8rem);
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  padding: 2rem 1rem;
  font-family: "Noto Sans KR", sans-serif;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.section-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background: #2563eb;
  margin: 0.5rem auto 0;
  border-radius: 2px;
}

.ranking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.header-item {
  text-align: center;
}

/* 리스트 영역 고정 (5줄까지) */
.ranking-list {
  flex: 1;
  max-height: calc(5 * 3.5rem); /* 최대 5개까지만 보이게 */
  overflow-y: scroll;            /* 항상 스크롤 표시 */
}

.ranking-header {
  display: grid;
  grid-template-columns: 0.7fr 1.5fr 1.5fr 2fr;
  background-color: #f1f5f9;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  border-bottom: 2px solid #e2e8f0;
}

.ranking-item {
  display: grid;
  grid-template-columns: 0.7fr 1.5fr 1.5fr 2fr;
  padding: 1rem;
  align-items: center;
  font-size: 0.95rem;
  border-bottom: 1px solid #f1f5f9;
}

.rank-number {
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.prize-amount {
  text-align: center;
  font-weight: bold;
  color: #2563eb;
}

.qr-rank {
  text-align: center;
  font-weight: 500;
  color: #111827;
}

.register-date {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.total-section {
  padding: 1rem;
  background-color: #f9fafb;
  border-top: 2px solid #f1f5f9;
  text-align: center;
}

.total-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #111827;
}

.back-btn-wrapper {
  text-align: center;
  margin-top: 1.5rem;
}

.back-btn {
  padding: 0.6rem 1.2rem;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.back-btn:hover {
  background-color: #1d4ed8;
}
</style>

