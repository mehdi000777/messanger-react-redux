import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Chats from "./pages/Chats"
import Layout from "./components/Layout"
import PersistLogin from "./components/Auth/PersistLogin"
import ProtectedRout from "./components/Auth/protectedRout"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route element={<PersistLogin />}>
          <Route index element={<Home />} />
          <Route element={<ProtectedRout />}>
            <Route path="chats" element={<Chats />} />
          </Route>
        </Route>
      </Route>
    </Routes >
  )
}

export default App
