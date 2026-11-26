import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Inisialisasi state langsung mengecek window jika tersedia (client-side)
  const [isMobile, setIsMobile] = React.useState<boolean>(() => 
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    // Hapus baris setIsMobile di sini karena state sudah diinisialisasi di atas
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}