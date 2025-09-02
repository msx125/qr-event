let fetcher: ReturnType<typeof $fetch.create> | null = null

export function useFetcher() {
    if (!fetcher) {
        const config = useRuntimeConfig()
        // const { VITE_BASE_URL } = import.meta.env 대체
        const baseURL = config.public?.apiBase || import.meta.env.VITE_BASE_URL || ''

        fetcher = $fetch.create({
            baseURL,
            onRequest({ options }) {
                if (process.client) {
                    const token = localStorage.getItem('accessToken')
                    if (token) {
                        const h = new Headers(options.headers || {})
                        h.set('Authorization', `Bearer ${token}`)
                        options.headers = h
                    }
                }
            },
            onResponseError({ response }) {
                if (response.status === 401 && process.client) {
                    localStorage.removeItem('accessToken')
                    sessionStorage.clear()
                    const qrKey = sessionStorage.getItem('qrKey') || ''
                    navigateTo(`/?qrKey=${encodeURIComponent(qrKey)}`, { replace: true })
                }
            }
        })
    }
    return fetcher
}