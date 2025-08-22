export default defineNuxtRouteMiddleware((to, from) => {

    // 어떤 페이지를 접속하더라도 한번 거치는 곳
    // 모든 페이지의 가장 최상위 스크립트 (엄밀하게는 아님)
    
    // SSR 기능이 꺼져도 서버 컨텍스트가 존재해서, 서버에서 localStorage 사용하면 안된다고 함
    // 따라서 LocalStorage 사용을 위한 방어문 작성
    if (process.server) return

    const publicPaths = ['/']
    if (publicPaths.includes(to.path)) return

    const token = localStorage.getItem('accessToken')
    if (!token && to.path !== '/') {
        // 이전 스택 리스트를 쌓는게 아니라 아예 대체시켜버리는...
        return navigateTo('/', {replace: true})
    }
})



