import { Routes, Route } from 'react-router-dom'
import { SignInPage, AuthCallback, MyShelfPage } from '@/pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MyShelfPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  )
}

export default App
