import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)  // ← null = ยังไม่ได้ login

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook สำหรับเรียกใช้
export function useAuth() {
  return useContext(AuthContext)
}