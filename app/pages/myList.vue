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
                <span class="header-item">당첨 금액</span>
                <span class="header-item">등록 날짜</span>
                <span class="header-item">상세</span>
              </div>

              <div class="ranking-list">
                <div
                    v-for="(item, index) in rankingList"
                    :key="index"
                    class="ranking-item"
                >
                  <span class="rank-number">{{ getRankNumber(index) }}</span>
                  <span class="prize-amount">
                    {{ Number(item.totalPoint || 0).toLocaleString() }}
                  </span>
                  <span class="register-date">
                    {{ formatDate(item.regDate) }}
                  </span>
                  <button
                      class="detail-button"
                      @click="showDetail(item, index)"
                  >
                    상세
                  </button>
                </div>
              </div>

              <!-- 누적 합계 -->
              <div class="total-section">
                <p class="total-text">
                  누적 포인트 합계 : {{ totalPrize.toLocaleString() }} P
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>상세 내역</h3>
          <button class="close-button" @click="closeDetail">×</button>
        </div>

        <div class="modal-body">
          <div v-if="selectedDetail" class="detail-info">
            <div class="info-row">
              <span class="label">순번</span>
              <span class="value">{{ selectedDetail.rank }}</span>
            </div>
            <div class="info-row">
              <span class="label">당첨 금액</span>
              <span class="value">
                {{ Number(selectedDetail.totalPoint || 0).toLocaleString() }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">등록일</span>
              <span class="value">
                {{ formatDate(selectedDetail.regDate) }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="confirm-button" @click="closeDetail">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const isLoading = ref(true)
const errorMessage = ref("")
const rankingList = ref([])
const totalPrize = ref(0)
const currentPage = ref(0)

// 모달 상태
const showDetailModal = ref(false)
const selectedDetail = ref(null)

// No. 계산
const getRankNumber = (index) => {
  return currentPage.value * 10 + index + 1
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return "-"
  return new Date(dateString)
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
      .replace(/\./g, "-")
      .replace(" ", " ")
}

// 데이터 로드 (더미데이터 강제 포함)
const loadRankingData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ""

    // 더미 데이터 넣어줌
    rankingList.value = [
      { rank: 1, totalPoint: 1000, regDate: "2025-08-28" },
      { rank: 2, totalPoint: 2000, regDate: "2025-08-27" },
      { rank: 3, totalPoint: 1500, regDate: "2025-08-26" },
      { rank: 4, totalPoint: 500, regDate: "2025-08-25" }
    ]

    totalPrize.value = rankingList.value.reduce(
        (sum, i) => sum + (i.totalPoint || 0),
        0
    )
  } catch (err) {
    console.error(err)
    errorMessage.value = "데이터 불러오기 실패"
  } finally {
    isLoading.value = false
  }
}

// 상세 모달 닫기
const closeDetail = () => {
  showDetailModal.value = false
  selectedDetail.value = null
}

// 상세 모달 열기
const showDetail = (item, index) => {
  selectedDetail.value = { ...item, rank: getRankNumber(index) }
  showDetailModal.value = true
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
  grid-template-columns: 0.7fr 2fr 2fr 1fr;
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
  grid-template-columns: 0.7fr 2fr 2fr 1fr;
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

.prize-amount {
  text-align: center;
  font-weight: bold;
  color: #2563eb;
}

.register-date {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease;
}

.detail-button:hover {
  background: #1d4ed8;
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

/* 모달 디자인 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.close-button:hover {
  color: #374151;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.label {
  font-weight: 600;
  color: #374151;
}

.value {
  color: #111827;
}

.modal-footer {
  margin-top: 1.5rem;
  text-align: right;
}

.confirm-button {
  background: #2563eb;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.confirm-button:hover {
  background: #1d4ed8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
