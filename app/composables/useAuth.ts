// ~/composables/useAuth.ts
export const useAuth = () => {
    // 로그인 여부 상태 (true, false)
    
    // !! -> 값을 불리언으로 바꾸는 빠른 문법
    const isAuthed = useState<boolean>('auth:isAuthed', () => {
        if (process.client) return !!localStorage.getItem('accessToken')
        return false
    })

    // 로그인한 사람의 이름 상태
    const name = useState<string>('auth:name', () => {
        if (process.client) return localStorage.getItem('memName') || ''
            return ''
    })

    // 로그인 여부를 바꾸는 함수
    const setAuthed = (v: boolean) => { isAuthed.value = v }

    // 이름을 바꾸는 함수
    const setName = (n: string) => {
        const v = (n ?? '').trim()
        name.value = v
        if (process.client) localStorage.setItem('memName', v)
    }

    // 로그아웃을 처리하는 함수
    const logout = () => {
        if (process.client) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('memName')
            sessionStorage.clear()
        }
        isAuthed.value = false
        name.value = ''
        navigateTo('/', { replace: true })
    }

    return { isAuthed, name, setAuthed, setName, logout }
}
