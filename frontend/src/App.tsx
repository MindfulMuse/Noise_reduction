import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ConsolePage from './pages/Console';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/console" element={<ConsolePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

