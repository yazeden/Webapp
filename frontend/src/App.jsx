import { useState } from 'react'
import './App.css'
import SignUp from './SignUp.jsx' 

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  )
}

export default App
