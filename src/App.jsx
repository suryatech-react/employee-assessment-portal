import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import InterviewManagement from './pages/admin/InterviewManagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="InterviewManagement" element={<InterviewManagement/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;