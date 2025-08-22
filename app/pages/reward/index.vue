<template>
  <div class="page-container">
    <!-- Main Content -->
    <main class="main-content">
      <div class="content-card">

<!--        <div v-if="pending" class="status-message">확인 중…</div>-->
<!--        <div v-else-if="error" class="error-message">유효하지 않은 코드입니다.</div>-->
        <div class="success-content">
          <h2 class="title">당첨 금액</h2>
          <p class="amount">10,000원</p>
          <p class="congratulations">축하드립니다! 당첨금을 확인해 주세요!</p>
          <small class="code-display">코드: {{ code }}</small>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const qrKey = computed(() => String(route.query.qrKey ?? ''))
const isLoading = ref(false)

// QR 코드 인증에 대한 부분
const res = await $fetch('users/qr', {})

// 로그인 요청




// 재영님에게, qr 코드와 토큰 요청
// 토큰을 검증하고, point를 응답

// 사용자 별로 얻은 포인트를 화면에 뿌린다

// 나한테, QR 코드와 토큰을 요청하라? 서버에 보내라?
// 토큰을 검증하고 QR코등; 해당하는 POINT 응답하겠다

// /users/qr
// 요청
// {
//   "seq": "시퀀스 번호 (int)",
//     "qrKey": "qrKey값 (string)"
// }
// 응답 성공
// {
//   "ok": true,
//     "points": "포인트액수",
//     "name": "회원명",
//     "memo": "정상처리"
// }
// 응답 실패
// {
//   "ok": false,
//     "points": null,
//     "name": null,
//     "memo": "실패 사유"
// }

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

.status-message {
  font-size: 1.1rem;
  color: #666;
}

.error-message {
  font-size: 1.1rem;
  color: #dc2626;
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.congratulations {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.code-display {
  color: #999;
  font-size: 0.8rem;
  margin-top: 1rem;
}
</style>