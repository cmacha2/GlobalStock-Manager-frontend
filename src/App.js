import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Items from './pages/Items';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

const { Content } = Layout;

const PrivateRoute = ({ children }) => {
  const { currentUser, credentialsConfigured } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false);
  }, [currentUser, credentialsConfigured]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return credentialsConfigured ? children : <Navigate to="/settings" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Navbar />
          <Content style={{ padding: '50px' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/items"
                element={
                  <PrivateRoute>
                    <Items />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/items" />} />
            </Routes>
          </Content>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
