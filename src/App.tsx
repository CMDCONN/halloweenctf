import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { AuthProvider, GuestOnly, RequireAuth } from './auth.tsx'
import Layout from './components/Layout.tsx'
import SpookyBackground from './components/SpookyBackground.tsx'
import Accuse from './pages/Accuse.tsx'
import CoronersOffice from './pages/CoronersOffice.tsx'
import Feed from './pages/Feed.tsx'
import Login from './pages/Login.tsx'
import PostPage from './pages/PostPage.tsx'
import Profile from './pages/Profile.tsx'
import Register from './pages/Register.tsx'
import Search from './pages/Search.tsx'
import Settings from './pages/Settings.tsx'

function NotFound() {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="logo logo-lg">404</h1>
        <p className="tagline">This page has passed beyond the veil.</p>
        <Link to="/" className="btn btn-primary btn-block">
          Return to the living
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpookyBackground />
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Feed />} />
            <Route path="u/:username" element={<Profile />} />
            <Route path="p/:id" element={<PostPage />} />
            <Route path="search" element={<Search />} />
            <Route path="accuse" element={<Accuse />} />
            <Route path="settings" element={<Settings />} />
            <Route path="coroners-office" element={<CoronersOffice />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
