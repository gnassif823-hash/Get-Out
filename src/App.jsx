import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import MapPage from './pages/Map';
import Events from './pages/Events';
import Lounge from './pages/Lounge';
import CallCenter from './pages/CallCenter';
import Gallery from './pages/Gallery';
import Reels from './pages/Reels';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="map" element={<MapPage />} />
        <Route path="events" element={<Events />} />
        <Route path="lounge" element={<Lounge />} />
        <Route path="call" element={<CallCenter />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="reels" element={<Reels />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
