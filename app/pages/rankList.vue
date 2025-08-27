<template>
  <div class="page-container">
    <main class="main-content">
      <div class="content-wrapper">
        <div class="ranking-section">
          <h2 class="section-title">당첨 결과</h2>

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
                <span class="header-item">No.</span>
                <span class="header-item">이름</span>
                <span class="header-item">당첨 금액</span>
                <span class="header-item">등록 날짜</span>
                <span class="header-item">상세</span>
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
                  <span class="prize-amount">{{ Number(item.totalPoint || 0).toLocaleString() }}</span>
                  <span class="register-date">{{ formatDate(item.regDate) }}</span>
                  <button
                      class="detail-button"
                      @click="showDetail(item, index)"
                  >
                    상세
                  </button>
                </div>
              </div>

              <!-- 총 당첨 금액 -->
              <div class="total-section">
                <p class="total-text">
                  당첨 금액 합계 : {{ totalPrize.toLocaleString() }}
                </p>
              </div>
            </div>

            <!-- 페이지네이션 버튼 -->
            <button
                v-if="hasNextPage"
                class="load-more-button"
                @click="loadMore"
                :disabled="isLoadingMore"
            >
              {{ isLoadingMore ? '로딩 중...' : '예전부터 더 보기' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- ✅ 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>당첨 결과 상세</h3>
          <button class="close-button" @click="closeDetail">×</button>
        </div>

        <div class="modal-body">
          <div v-if="selectedDetail" class="detail-info">
            <div class="info-row">
              <span class="label">순위</span>
              <span class="value">{{ selectedDetail.rank }}위</span>
            </div>
            <div class="info-row">
              <span class="label">이름</span>
              <span class="value">{{ selectedDetail.memName }}</span>
            </div>
            <div class="info-row">
              <span class="label">포인트</span>
              <span class="value">{{ Number(selectedDetail.totalPoint || 0).toLocaleString() }}</span>
            </div>
            <div class="info-row">
              <span class="label">등록일</span>
              <span class="value">{{ formatDate(selectedDetail.regDate) }}</span>
            </div>
          </div>
          <p v-else class="modal-message">조회되는 리스트가 없습니다.</p>
        </div>

        <div class="modal-footer">
          <button class="confirm-button" @click="closeDetail">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isLoading = ref(true)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const rankingList = ref([])
const totalPrize = ref(0)
const currentPage = ref(0)
const pageOffset = ref(0)
const hasNextPage = ref(false)

// 상세 모달 관련
const showDetailModal = ref(false)
const selectedDetail = ref(null)

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

// 순위 번호 계산
const getRankNumber = (index) => {
  const offset = pageOffset.value || 0
  return offset + index + 1
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\./g, '-').replace(' ', ' ')
}

// 랭킹 데이터 로드
const loadRankingData = async (page = 0) => {
  try {
    if (page === 0) {
      isLoading.value = true
      rankingList.value = []
      pageOffset.value = 0
    } else {
      isLoadingMore.value = true
    }

    errorMessage.value = ''

    // 🚧 서버 꺼진 상태 테스트용 더미 데이터
    const useMock = true
    if (useMock) {
      const mockItems = [
        { memName: '홍길동', totalPoint: 1000, regDate: '2025-08-01', isMe: true },
        { memName: '김철수', totalPoint: 800, regDate: '2025-08-02', isMe: false },
        { memName: '이영희', totalPoint: 600, regDate: '2025-08-03', isMe: false },
        { memName: '박민수', totalPoint: 400, regDate: '2025-08-04', isMe: false },
      ]

      rankingList.value = page === 0 ? mockItems : [...rankingList.value, ...mockItems]

      totalPrize.value = rankingList.value.reduce((sum, item) => sum + Number(item.totalPoint || 0), 0)

      hasNextPage.value = page < 1
      currentPage.value = page

      isLoading.value = false
      isLoadingMore.value = false
      return
    }

    // 실제 서버 호출
    const response = await api('/api/users/rank', {
      method: 'GET',
      params: { page, size: 10 }
    })

    if (response?.content) {
      const newItems = response.content

      if (response.pageable?.offset !== undefined) {
        if (page === 0) {
          pageOffset.value = response.pageable.offset
        }
      }

      if (page === 0) {
        rankingList.value = newItems
      } else {
        rankingList.value.push(...newItems)
      }

      totalPrize.value = rankingList.value.reduce((sum, item) => {
        return sum + Number(item.totalPoint || 0)
      }, 0)

      hasNextPage.value = !response.last
      currentPage.value = page
    }

  } catch (error) {
    errorMessage.value = error?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// 더 보기 버튼
const loadMore = () => {
  loadRankingData(currentPage.value + 1)
}

// 상세 보기
const showDetail = (item, index) => {
  console.log("상세 클릭:", item, index) // 디버깅 로그
  selectedDetail.value = {
    ...item,
    rank: getRankNumber(index)
  }
  showDetailModal.value = true
}

// 상세 모달 닫기
const closeDetail = () => {
  showDetailModal.value = false
  selectedDetail.value = null
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadRankingData()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.status-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
  font-size: 1.1rem;
}

.ranking-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ranking-header {
  display: grid;
  grid-template-columns: 0.5fr 1.2fr 1.5fr 1.5fr 1fr;
  background-color: #f8f9fa;
  padding: 1rem;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #e9ecef;
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
  grid-template-columns: 0.5fr 1.2fr 1.5fr 1.5fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  align-items: center;
}

.ranking-item:hover {
  background-color: #f8f9fa;
}

.ranking-item.my-rank {
  background-color: #e3f2fd;
  font-weight: bold;
}

.rank-number,
.mem-name,
.prize-amount,
.register-date {
  text-align: center;
}

.detail-button {
  width: 100%;
  background: #333;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.detail-button:hover {
  background: #555;
}

.total-section {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 2px solid #e9ecef;
}

.total-text {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.load-more-button {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
}

.load-more-button:hover:not(:disabled) {
  background: #f8f9fa;
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ✅ 중앙 팝업 모달 */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
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
  font-weight: bold;
  color: #444;
}

.value {
  color: #333;
}

.modal-footer {
  margin-top: 1.5rem;
  text-align: right;
}

.confirm-button {
  background: #333;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.confirm-button:hover {
  background: #555;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
