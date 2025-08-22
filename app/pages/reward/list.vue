<!-- pages/rewards/index.vue (예시) -->
<template>
  <div class="page-container">
    <main class="main-content">
      <section class="card">
        <div class="card-head">
          <h1>당첨 내역</h1>

          <!-- 검색바 -->
          <div class="searchbar">
            <select v-model="searchField" class="select">
              <option value="code">코드</option>
              <option value="message">메시지</option>
            </select>
            <input
                v-model.trim="keyword"
                type="text"
                placeholder="검색어를 입력하세요"
                @keydown.enter.prevent="page = 1"
                class="input"
            />
            <button class="btn" @click="page = 1">검색</button>
            <button class="btn" v-if="keyword" @click="keyword = ''">초기화</button>
          </div>
        </div>

        <div class="card-body">
          <!-- 로딩 -->
          <div v-if="pending" class="status">불러오는 중…</div>

          <!-- 에러 -->
          <div v-else-if="error" class="error">목록을 불러올 수 없습니다.</div>

          <!-- 테이블 -->
          <div v-else class="table-wrap">
            <table class="table">
              <colgroup>
                <col style="width: 80px" />
                <col style="width: 160px" />
                <col style="width: 120px" />
                <col />
                <col style="width: 120px" />
                <col style="width: 160px" />
              </colgroup>
              <thead>
              <tr>
                <th>번호</th>
                <th>QR 코드</th>
                <th>포인트</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, i) in paged" :key="row.id">
                <td>{{ rowNo(i) }}</td>
                <td class="mono">{{ row.code }}</td>
                <td class="amount">{{ row.amount.toLocaleString() }} P</td>
                <td>
                    <span :class="['badge', row.amount > 0 ? 'ok' : 'nope']">
                      {{ row.amount > 0 ? '등록' : '미등록' }}
                    </span>
                </td>
                <td>{{ fmtDate(row.createdAt) }}</td>
              </tr>
              <tr v-if="!paged.length">
                <td colspan="6" class="empty">데이터가 없습니다.</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div class="pager" v-if="totalPages > 1">
            <button class="btn" :disabled="page === 1" @click="page--">이전</button>
            <span class="page-info">{{ page }} / {{ totalPages }}</span>
            <button class="btn" :disabled="page === totalPages" @click="page++">다음</button>
          </div>

        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Row = {
  id: number
  code: string
  amount: number
  createdAt: string
}

/** ================================
 *  서버 없이 바로 보이는 더미 데이터
 *  ================================ */
const dummy: Row[] = [
  { id: 1, code: 'QR-AB12-0001', amount: 10000, message: '축하합니다!', createdAt: '2025-08-20T09:12:00Z' },
  { id: 2, code: 'QR-AB12-0002', amount: 0, message: '아쉽지만 미당첨', createdAt: '2025-08-20T10:45:00Z' },
  { id: 3, code: 'QR-AB12-0003', amount: 5000, message: '소액 당첨!', createdAt: '2025-08-21T02:30:00Z' },
  { id: 4, code: 'QR-AB12-0004', amount: 0, message: '', createdAt: '2025-08-21T07:03:00Z' },
  { id: 5, code: 'QR-AB12-0005', amount: 20000, message: '행운의 코드!', createdAt: '2025-08-21T13:22:00Z' },
  { id: 6, code: 'QR-AB12-0006', amount: 0, message: '다음 기회에…', createdAt: '2025-08-21T15:55:00Z' },
  { id: 7, code: 'QR-AB12-0007', amount: 12000, message: '', createdAt: '2025-08-22T00:11:00Z' },
  { id: 8, code: 'QR-AB12-0008', amount: 0, message: '', createdAt: '2025-08-22T01:24:00Z' },
  { id: 9, code: 'QR-AB12-0009', amount: 3000, message: '소소한 행복', createdAt: '2025-08-22T02:40:00Z' },
  { id: 10, code: 'QR-AB12-0010', amount: 0, message: '미당첨', createdAt: '2025-08-22T03:10:00Z' },
  { id: 11, code: 'QR-AB12-0011', amount: 8000, message: '축!', createdAt: '2025-08-22T04:05:00Z' },
]

/** 상태 (서버 붙일 때 대체 가능) */
const pending = ref(false)
const error = ref<unknown | null>(null)

/** 검색 + 페이징 */
const searchField = ref<'code' | 'message'>('code')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return dummy
  return dummy.filter(row => {
    const target = (row[searchField.value] || '').toString().toLowerCase()
    return target.includes(kw)
  })
})

const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
const rowNo = (i: number) => (page.value - 1) * pageSize.value + (i + 1)

/** 유틸 */
function fmtDate(iso: string) {
  const d = new Date(iso)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yy}-${mm}-${dd} ${hh}:${mi}`
}

/** ================================
 *  TODO: 서버 붙일 때 이 블록으로 교체
 *  ================================
 * const { data, pending, error } = await useFetch<Row[]>('/api/rewards', { query: { q: keyword.value, page: page.value, limit: pageSize.value }, key: () => `rewards-${keyword.value}-${page.value}-${pageSize.value}` })
 * const filtered = computed(() => data.value ?? [])
 * const total = computed(() => Number(headers.value?.['x-total-count'] ?? filtered.value.length))
 * const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
 * const paged = computed(() => filtered.value) // 서버가 페이지네이션해서 내려오는 경우
 */
</script>

<style scoped>
/* 레이아웃 */
.page-container { min-height: 100vh; background: #f5f5f5; }
.main-content { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }

/* 카드 */
.card { background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,.08); }
.card-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.card-head h1 { margin: 0; font-size: 20px; color: #1f2937; }
.card-body { padding: 16px 24px 20px; }

/* 검색 */
.searchbar { display: flex; gap: 8px; align-items: center; }
.select, .input, .btn { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 10px; font-size: 14px; }
.input { flex: 1; }
.btn { background: #f9fafb; cursor: pointer; }
.btn:hover { background: #f3f4f6; }

/* 테이블 */
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; }
.table thead th {
  text-align: left; font-weight: 600; font-size: 13px; color: #374151;
  background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 10px 12px;
  position: sticky; top: 0; z-index: 1;
}
.table tbody td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1f2937; }
.table tbody tr:hover { background: #fafafa; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.amount { font-weight: 700; color: #2563eb; }
.ellipsis { max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty { text-align: center; color: #6b7280; padding: 32px 12px; }

/* 배지 */
.badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.ok { background: #ecfdf5; color: #047857; }
.badge.nope { background: #fef2f2; color: #b91c1c; }

/* 상태 */
.status { color: #6b7280; }
.error { color: #b91c1c; }

/* 페이저 */
.pager { display: flex; justify-content: center; align-items: center; gap: 10px; padding-top: 16px; }
.page-info { font-size: 14px; color: #4b5563; }
</style>
