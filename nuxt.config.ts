// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
    ssr: false,
    runtimeConfig: {
      public: {
          // Nuxt 서버 라우트로 '로그인 성공' 흉내내기 용도
        mock:true
      }
    },
    devServer: {
      host: '0.0.0.0',
    }
})
