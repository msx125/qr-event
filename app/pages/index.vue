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
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// 대기 UI
const isLoading = ref(false)

// 폼 상태
const requestParams = reactive({
  id: '',
  password: '',
})

// 토큰 로컬스토리지 저장


// URL 에서 QR 코드 읽기 : 로그인 이후 qrKey를 qr api로 전송. (json 형태로 body에 넣어서 post

const qrKey = computed(() => String(route.query.qrKey ?? ''))
console.log(qrKey.value)

const handleLogin = async () => {
  try {

    isLoading.value = true

    // fetcher 바꾸기
    // header 안에 Authorization 라는 객체를 넣었어야 했는데..
    // 저기서 어떻게 안과, 계층과
    // ??? 어떻게 하는거지 ???
    // header A 직접 넣어야했는데,
    const {VITE_BASE_URL} = import.meta.env
    const api = $fetch.create({
      baseURL: VITE_BASE_URL,
      onRequest: (config) => {
        const token = localStorage.getItem('accessToken')
        if(token){
          // http 헤더가 어떻게 통신하는지..
          // API 는 네트워크 공부를 할 수 밖에 없다.
          // 네트워크 책을 사서 보면되는건가 ? 웹개발 강의가 더 빠르다
          config.headers = {'Authorization' : `Bearer ${token}`}
        }
      }
    })



    // 로그인 요청
    const res = await api('users/login', {
      method: 'POST',
      body: { id: requestParams.id, password: requestParams.password },
    })

    console.log(res)



    if (res) {
      if(res.결과 === "성공") {
        console.log("로그인 성공")
        console.log(res.seq)
        console.log(res.accessToken)

        localStorage.setItem('accessToken', res.accessToken)

        // 리워드 페이지 이동
        return navigateTo(`/reward?qrKey=${qrKey.value}`, {
          replace: true,
        })

      } else {
        console.log("로그인 실패")
      }
    } else {
      console.log("서버 통신 오류")
    }


    // TODO 로그인하고나서 다시 QR로 들어온 페이지로 다시 보내야된다.

    // 로그인 성공하고 라우팅 되게끔

    // TODO 미들웨어에서 받은 쿼리로 다시 보내기


  } catch (error) {
    console.error(error)
  }
}



</script>

<style scoped>
.login-container {
  min-height: 100vh;
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
</style>