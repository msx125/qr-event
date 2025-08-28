<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-wrapper">
        <div class="ranking-section">
          <h2 class="section-title">포인트 순위</h2>

          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="status-message">
            데이터를 불러오는 중...
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- 랭킹 리스트 -->
          <div v-else class="ranking-container">
            <div class="ranking-card">
              <div class="ranking-header">
                <span class="header-item">순위</span>
                <span class="header-item">이름</span>
                <span class="header-item">총 포인트</span>
              </div>

              <div class="ranking-list">
                <div
                    v-for="(item, index) in rankingList"
                    :key="index"
                    class="ranking-item"
                    :class="{ 'my-rank': item.isMe }"
                >
                  <span class="rank-number">{{ getRankNumber(index) }}</span>
                  <span class="mem-name">{{ item.memName }}</span>
                  <span class="prize-amount">
                    {{ Number(item.totalPoint || 0).toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- 총 합계 -->
              <div class="total-section">
                <p class="total-text">
                  총 누적 포인트 : {{ totalPrize.toLocaleString() }} P
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const isLoading = ref(true)
const errorMessage = ref("")
const rankingList = ref([])
const totalPrize = ref(0)
const currentPage = ref(0)

// ✅ 내 계정 이름 (로그인 시 localStorage에 저장된 값)
const myName = localStorage.getItem("memName") || ""

// 순위 번호 계산
const getRankNumber = (index) => {
  return currentPage.value * 10 + index + 1
}

// fetcher
const { VITE_BASE_URL } = import.meta.env
const api = $fetch.create({
  baseURL: VITE_BASE_URL,
  onRequest({ options }) {
    const token = localStorage.getItem("accessToken")
    if (token) {
      options.headers = new Headers(options.headers || {})
      options.headers.set("Authorization", `Bearer ${token}`)
    }
  }
})

// 데이터 로드
const loadRankingData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ""

    const res = await api("/api/users/rank", { method: "GET" })
    console.log("/api/users/rank 응답값 체크: ", res)

    if (res?.data && Array.isArray(res.data)) {
      rankingList.value = res.data.map((it) => ({
        memName: it.MEM_NAME,
        totalPoint: Number(it.TOTAL_POINT) || 0,
        isMe: it.MEM_NAME === myName // ✅ 내 계정 강조
      }))
      totalPrize.value = rankingList.value.reduce(
          (sum, item) => sum + item.totalPoint,
          0
      )
    } else if (res?.result) {
      errorMessage.value = res.result
      rankingList.value = []
      totalPrize.value = 0
    } else {
      errorMessage.value = "알 수 없는 응답 형식입니다."
      rankingList.value = []
      totalPrize.value = 0
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = "데이터 불러오기 실패"
    rankingList.value = []
    totalPrize.value = 0
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
  min-height: 100vh;
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
}

.ranking-card:hover {
  transform: translateY(-2px);
}

.ranking-header {
  display: grid;
  grid-template-columns: 0.7fr 2fr 2fr;
  background-color: #f1f5f9;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  border-bottom: 2px solid #e2e8f0;
}

.header-item {
  text-align: center;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: grid;
  grid-template-columns: 0.7fr 2fr 2fr;
  padding: 1rem;
  align-items: center;
  font-size: 0.95rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s ease;
}

.ranking-item:hover {
  background-color: #f9fafb;
}

.rank-number {
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.mem-name {
  text-align: center;
  font-weight: 500;
  color: #111827;
}

.prize-amount {
  text-align: center;
  font-weight: bold;
  color: #2563eb;
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

.my-rank {
  background-color: #eff6ff; /* 연한 파란색 */
  font-weight: bold;
  color: #1d4ed8; /* 진한 파랑 텍스트 */
}

</style>
