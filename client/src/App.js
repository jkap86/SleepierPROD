import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './components/homepage';
import Main from './components/main';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/:username' element={<Main />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
