import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useContext, useEffect } from "react";
import { publicRoutes, authRoutes, locketRoutes } from "./routes";
import { AuthProvider, AuthContext } from "./context/AuthLocket";
import { ThemeProvider } from "./context/ThemeContext"; // 🟢 Import ThemeProvider
import { AppProvider } from "./context/AppContext";
import Loading from "./components/Loading";
import ToastProvider from "./components/Toast";
import NotFoundPage from "./components/404";
import InstallPWA from "./components/InstallPWA";
import getLayout from "./layouts";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider> {/* 🟢 Thêm AppProvider ở đây */}
          <Router>
            <AppContent />
          </Router>
          <ToastProvider />
          <InstallPWA />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const allRoutes = [...publicRoutes, ...authRoutes, ...locketRoutes];
    const currentRoute = allRoutes.find(
      (route) => route.path === location.pathname
    );
    document.title = currentRoute ? currentRoute.title : "Ứng dụng của bạn";
  }, [location.pathname]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Clear all caches first
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        // Unregister old service workers
        return navigator.serviceWorker.getRegistrations();
      }).then(registrations => {
        return Promise.all(
          registrations.map(registration => {
            console.log('Unregistering service worker:', registration);
            return registration.unregister();
          })
        );
      }).then(() => {
        // Register new service worker
        return navigator.serviceWorker.register('/service-worker.js', {
          updateViaCache: 'none'
        });
      }).then(registration => {
        console.log('Service Worker đăng ký thành công: ', registration);
        
        // Force update if needed
        registration.update();
      }).catch(error => {
        console.log('Service Worker đăng ký thất bại: ', error);
      });
    }
  }, []);

  if (loading) return <Loading isLoading={true} />;

  
  return (
    <Routes>
      {user
        ? authRoutes.map(({ path, component: Component }, index) => {
            const Layout = getLayout(path);
            return (
              <Route
                key={index}
                path={path}
                element={
                  <Layout>
                    <Component />
                  </Layout>
                }
              />
            );
          })
        : publicRoutes.map(({ path, component: Component }, index) => {
            const Layout = getLayout(path);
            return (
              <Route
                key={index}
                path={path}
                element={
                  <Layout>
                    <Component />
                  </Layout>
                }
              />
            );
          })}

      {!user &&
        authRoutes.map(({ path }, index) => (
          <Route key={index} path={path} element={<Navigate to="/login" />} />
        ))}

      {user &&
        publicRoutes.map(({ path }, index) => (
          <Route key={index} path={path} element={<Navigate to="/home" />} />
        ))}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


export default App;
