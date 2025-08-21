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
              placeholder="인트라넷 아이디를 입력해주세요."
              v-model="requestParams.userId"
          />
        </div>
        <!-- pw 입력 -->
        <div class="input-group">
          <input
              class="input-field"
              v-model="requestParams.password"
              type="password"
              placeholder="인트라넷 비밀번호를 입력해주세요."
          />
        </div>
        <button type="submit" class="login-button" @click="handleLogin">
          🎁 당첨 확인 🎁
        </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const requestParams = reactive({
  userId: '',
  password: '',
})


// 쿠키

const handleLogin = async () => {
  console.log("로그인 클릭") }
  /* if (!requestParams.userId || !requestParams.password) {
    return
  }
  if (requestParams.password.length < 6) {
    return
  }
  try {
    const res = await $fetch('/users/login', {
      method: 'POST',
      body: requestParams
    })

    console.log("로그인 성공", res)
  } catch (err) {
    console.error("로그인 실패", err)
    alert("아이디 또는 비밀번호를 확인해주세요.")
  } */

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