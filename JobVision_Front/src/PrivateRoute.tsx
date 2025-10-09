import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function PrivateRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/auth/check`, {
            withCredentials: true
        })
            .then(() => {
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    if (isAuthenticated === null) return <div>Chargement...</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}


export default PrivateRoute;
