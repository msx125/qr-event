<template>
  <nav class="gnb">
    <div class="gnb-content">
      <NuxtLink class="logo" to="/reward" @click.prevent="handleLogo">
        <img src=/images/thumbnail_image_idevel.png />
      </NuxtLink>

      <!-- 로그인 화면에서는 nav-links 자체를 숨김 -->
      <div v-if="!isLoginPage" class="nav-links">

        <!-- 로그인 상태 -->
        <template v-if="isAuthed">
          <div>{{ name }} 님</div>
          <button class="nav-link-btn" @click="logout">로그아웃</button>
        </template>

        <!-- 비로그인 상태 -->
        <template v-else>
          <NuxtLink class="nav-link" to="/">로그인</NuxtLink>
        </template>

      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { isAuthed, name, logout } = useAuth()
const router = useRouter()

// 현재 라우트가 로그인 페이지("/")인지 판별
const isLoginPage = computed(() => route.path === '/')

const handleLogo = () => {
  try {
    // 1) QR 키 무효화
    sessionStorage.removeItem('qrKey')

    // 2) reward 캐시 삭제
    for (const rewardHistory of Object.keys(sessionStorage)) {
      if (rewardHistory.startsWith('reward:')) {
        sessionStorage.removeItem(rewardHistory)
      }
    }

    // 3) 인트로 gif 건너뛰기
    sessionStorage.setItem('skipRewardIntro', '1')
  } catch {}

  // /reward 이동
  router.push('/reward')
}

</script>

<style scoped>

.gnb {
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 1rem 0;
}

.gnb-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img {
  max-height: 40px;   /* 기본 크기 */
  max-width: 120px;   /* 가로 제한 */
  height: auto;
  width: auto;
  object-fit: contain;
  display: block;
}

.logo {
  flex-shrink: 1;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;  /* 버튼 안 사라지게 고정 */
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: #333;
}

.nav-link-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.nav-link-btn:hover {
  color: #333;
  text-decoration: underline;
}

</style>
<script setup lang="ts">
</script>