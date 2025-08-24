<template>
  <div class="page-container">
    <!-- Main Content -->
    <main class="main-content">
      <div class="content-card">

        <!--        <div v-if="pending" class="status-message">확인 중…</div>-->
        <!--        <div v-else-if="error" class="error-message">유효하지 않은 코드입니다.</div>-->
        <div class="success-content">
          <h2 class="title">당첨 포인트</h2>
          <p class="congratulations">축하드립니다! {{ name}} 님</p>
          <p class="amount"> {{ points }} 포인트 획득! </p>
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


// 포맷터 알아보기
const {VITE_BASE_URL} = import.meta.env
// const api = $fetch.create({
//   baseURL: VITE_BASE_URL,
//   onRequest: (config) => {
//     const token = localStorage.getItem('accessToken')
//     if(token){
//       config.headers = {'Authorization' : `Bearer ${token}`}
//     }
//   }
// })
const api = $fetch.create({
  baseURL: VITE_BASE_URL,
  onRequest({ options }) {
    const token = localStorage.getItem('accessToken')
    if (token) {

      // 구조 분해 방식
      options.headers = new Headers(options.headers || {})
      options.headers.set('Authorization', `Bearer ${token}`)
    }
  }
})

// QR 코드 인증에 대한 부분 ( 재영님에게, qr 코드와 토큰 요청  - 토큰을 검증하고, point를 응답)
// 나한테, QR 코드와 토큰을 요청하라? 서버에 보내라?
// 토큰을 검증하고 QR코등; 해당하는 POINT 응답하겠다
const res = await api('/api/users/qr', {
  method: 'POST',
  body: {
    qrKey: qrKey.value,
  }
})

console.log(res)

const name = res.name
const points = res.points


// 타입스크립트로 바꾸기
// api 컴포저블화

// 요청
// {
//   "seq": "시퀀스 번호 (int)",
//     "qrKey": "qrKey값 (string)"
// }


//

// 리스트 : 총 포인트를 화면
// 백엔드 인턴2명과, 내 프론트
// 리스트 총포인트 X

// 그냥 백엔드에서 보내줄때 총 포인트, 얻은 포인트
//



// 사용자 별로 얻은 포인트를 화면에 뿌린다

//

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
</style>