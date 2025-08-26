// ~/composables/useAuth.ts
export const useAuth = () => {
    // 로그인 여부
    const isAuthed = useState<boolean>('auth:isAuthed', () => {
        if (process.client) return !!localStorage.getItem('accessToken')
        return false
    })

    // 표시할 이름 ( 새로고침 해도 유지 )
    const name = useState<string>('auth:name', () => {
        if (process.client) return localStorage.getItem('memName') || ''
            return ''
    })


    const setAuthed = (v: boolean) => { isAuthed.value = v }
    const setName = (n: string) => {
        const v = (n ?? '').trim()
        name.value = v
        if (process.client) localStorage.setItem('memName', v)
    }

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
