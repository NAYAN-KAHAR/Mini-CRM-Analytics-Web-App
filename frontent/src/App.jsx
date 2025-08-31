import Customer from "./components/customer"
import Deals from "./components/deals"
import FormPage from "./components/form"
import { Routes, Route } from 'react-router-dom'
import Navbar from "./components/nav"
import DashBoard from "./components/dashboard"
import ProtectedRoute from "./components/protected"; // 👈 import this
import NotFound from "./components/error"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FormPage />} />

        {/* protected routes with navbar */}
        <Route path="/customers" element={ 
           <ProtectedRoute>
              <>
                <Navbar />
                <Customer />
              </>
            </ProtectedRoute>}/>

        <Route path="/deals" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Deals />
              </>
            </ProtectedRoute> }/>


        <Route path="/dashboard" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <DashBoard />
              </>
            </ProtectedRoute> }/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

