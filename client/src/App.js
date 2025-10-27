import React from 'react'
import Login from './pages/Login';
import Callback from './pages/Callback';
import Transfer from './pages/Transfer';
import {BrowserRouter, Routes, Route} from 'react-router-dom'


function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = {<Login />} />
        <Route path = '/callback' element = {<Callback />} />
        <Route path="/transfer" element={<Transfer />} />  
      </Routes>
    </BrowserRouter>
  );
}


export default App;