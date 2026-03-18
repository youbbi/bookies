import { Routes, Route } from 'react-router-dom'
import { SignInPage, AuthCallback, MyShelfPage, PublicShelfPage } from '@/pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MyShelfPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/shelf/:username" element={<PublicShelfPage />} />
    </Routes>
  )
}

export default App
