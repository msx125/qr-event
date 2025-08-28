<template>
  <!-- 로그인 화면 -->
  <div class="login-container">
    <div class="login-form">
      <h1 class="title">IDEVEL</h1>
      <!-- id 입력 -->
      <div class="input-group">
        <input
            class="input-field"
            type="text"
            placeholder="아이디를 입력해주세요."
            v-model="requestParams.id"
        />
      </div>
      <!-- pw 입력 -->
      <div class="input-group">
        <input
            class="input-field"
            v-model="requestParams.password"
            type="password"
            placeholder="비밀번호를 입력해주세요."
        />
      </div>
      <button type="button" class="login-button" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '확인 중...' : '🎁 Point 확인하기 🎁' }}
      </button>

      <!--      유효성 검사 추가-->
      <p v-if="loginMemo" class="login-memo">{{ loginMemo }}</p>

    </div>
  </div>
</template>

<script setup>
const route = useRoute()
// const router = useRouter()
const { setAuthed, setName, logout } = useAuth()

// 대기 UI
const isLoading = ref(false)

// 폼 상태
const requestParams = reactive({
  id: '',
  password: '',
})

// 유효성 감사 안내문 노출용
const loginMemo = ref('')

// URL 에서 QR 코드 읽기
const qrKey = computed(() => String(route.query.qrKey ?? ''))

console.log(qrKey.value)

const handleLogin = async () => {
  if(isLoading.value) return
  isLoading.value = true
  loginMemo.value = ''

  try {
    // fetcher 로 빼기
    const { VITE_BASE_URL } = import.meta.env
    const api = $fetch.create({
      baseURL: VITE_BASE_URL,
      onRequest({ options }) {
        const token = localStorage.getItem('accessToken')
        console.log("token", token)
        if (token) {
          options.headers = new Headers(options.headers || {})
          options.headers.set('Authorization', `Bearer ${token}`)
        }
      },
      onResponseError({ response: res }) {
        if (res.status === 401) {
          logout()
        }
      }
    })

    // 로그인 요청
    const res = await api('/api/users/login', {
      method: 'POST',
      body: { id: requestParams.id, password: requestParams.password },
    })

    console.log("awit api 바로 다음 res", res)

    const serverMemo = String(res?.memo ?? res?.result ?? '')

    if (res) {
      if(res.result === "성공" && res.accessToken) {

        console.log("로그인 성공")

        console.log("2번째 다음 res", res)

        localStorage.setItem('accessToken', res.accessToken)
        console.log("액세스 토큰 저장 : ", res.accessToken)

        // 토큰을 저장하고 나면, 전역 상태에 '응 로그인 약속'
        setAuthed(true)

        // 사용자 이름 설정 -> 재영님이 아직 응답값 안줬음
        if (res.name) { setName(res.name) }
        localStorage.setItem('memName', res.name)

        // 리워드 페이지 이동
        return navigateTo(`/reward?qrKey=${qrKey.value}`, {
          replace: true,
        })

      } else {
        loginMemo.value = serverMemo || '로그인에 실패했습니다.'
      }
    } else {
      console.log("서버 통신, 200외 오류")
    }

  } catch (e) {

    // 서버 에러 일때도 서버가 전달한 메세지 노출
    loginMemo.value = String(e?.data?.memo ?? e?.data?.message ?? e?.message ?? '통신 중 문제가 발생했습니다.')

    // 패턴 숙지
  } finally {
    isLoading.value = false
  }
}

// 토큰 있으면 reward로 자동이동
onMounted(() => {
  const token = localStorage.getItem('accessToken')
  // 토큰 유효성도 확인해야 함
  if (token && token !== 'undefined' && token !== 'null') {
    return navigateTo(`/reward?qrKey=${encodeURIComponent(qrKey.value)}`, { replace: true })
  }
})

</script>

<style scoped>
.login-container {
  min-height: calc(100svh - 5.8rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;   /* ← 자식 텍스트 기본 중앙 정렬 */
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  letter-spacing: 2px;
}

.input-group {
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.2); /* 커스텀 포커스 */
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .login-container { background: #0f0f10; }
  .login-form { background: #161618; color: #eaeaea; }
  .input-field { background: #0f0f10; border-color: #2a2a2a; color: #eaeaea; }
  .input-field::placeholder { color: #9a9a9a; }
  .login-button { background: #2a2a2a; }
  .login-button:hover { background: #3a3a3a; }
}

.login-memo {
  margin-top: 16px;
  font-size: 14px;
  color: #dc2626;        /* 빨간색 */
  white-space: pre-wrap; /* 줄바꿈 그대로 표시 */
  text-align: center;    /* ← 중앙 정렬 */
  display: block;        /* 문단(block)으로 지정 */
}

</style>