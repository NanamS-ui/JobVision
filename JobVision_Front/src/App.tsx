import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Services } from "./pages/Services.tsx";
import { SSHKeys } from "./pages/SSHKeys.tsx";
import { Commands } from "./pages/Commands.tsx";
import { PopupProvider } from "./components/pop-up/PopupProviderProps.tsx";
import { Nodes } from "./pages/Nodes.tsx";
import { Projects } from "./pages/Projects.tsx";
import { JobCreate } from "./pages/JobCreate.tsx";
import { JobList } from "./pages/JobList.tsx";
import { JobStatistics } from "./pages/JobStatistics.tsx";
import { JobDetailsPage } from "./pages/JobDetailsPage.tsx";
import { ServiceDetail } from "./pages/ServiceDetail.tsx";
import { Logs } from "./pages/Logs.tsx";
import { ContactManagement } from "./pages/ContactManagement.tsx";
import { NotificationHistoryTab } from "./components/contacts/NotificationHistoryTab.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard.tsx";
import PrivateRoute from "./PrivateRoute.tsx";

function App() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        let logoutTimer: ReturnType<typeof setTimeout>;

        function resetTimer() {
            clearTimeout(logoutTimer);
            logoutTimer = setTimeout(() => {
                fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                }).finally(() => {
                    window.location.href = '/login';
                });
            }, 5 * 60 * 1000); // 5 minutes d'inactivité
        }

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);

        resetTimer();

        return () => {
            clearTimeout(logoutTimer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, []);

    return (
        <ThemeProvider>
            <PopupProvider>
                <Router>
                    <Routes>
                        <Route path="signup" element={<SignUp />} />
                        <Route path="login" element={<Login />} />
                        <Route element={<PrivateRoute />}>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="services" element={<Services />} />
                                <Route path="projects" element={<Projects />} />
                                <Route path="jobs/create" element={<JobCreate />} />
                                <Route path="jobs/edit/:idJob" element={<JobCreate />} />
                                <Route path="jobs/list" element={<JobList />} />
                                <Route path="jobs/statistics" element={<JobStatistics />} />
                                <Route path="keys" element={<SSHKeys />} />
                                <Route path="commands" element={<Commands />} />
                                <Route path="nodes" element={<Nodes />} />
                                <Route path="jobs/:idJob" element={<JobDetailsPage />} />
                                <Route path="/services/:id" element={<ServiceDetail />} />
                                <Route path="logs" element={<Logs />} />
                                <Route path="contacts" element={<ContactManagement />} />
                                <Route path="notifications" element={<NotificationHistoryTab />} />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
            </PopupProvider>
        </ThemeProvider>
    );
}

export default App;
