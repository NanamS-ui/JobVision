import React, {useEffect, useState} from 'react';
import { Eye, EyeOff, User, Lock, Moon, Sun, AlertCircle, X } from 'lucide-react';
import {LoginResponse} from "../types/LoginResponse.ts";
import {useNavigate} from "react-router-dom";
import {loginApi} from "../api/loginApi.ts";

const Login = () => {
    useEffect(() => {
        document.title = "Login - JobVision";
    }, []);

    const [formData, setFormData] = useState({
        matricule: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('jwt')) {
            navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (error) {
            setError('');
            setShowError(false);
        }
    };

    const clearError = () => {
        setError('');
        setShowError(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation côté client
        if (!formData.matricule.trim()) {
            setError('Veuillez saisir votre matricule');
            setErrorType('warning');
            setShowError(true);
            setIsLoading(false);
            return;
        }

        if (!formData.password.trim()) {
            setError('Veuillez saisir votre mot de passe');
            setErrorType('warning');
            setShowError(true);
            setIsLoading(false);
            return;
        }

        try {
            const data: LoginResponse = await loginApi(formData.matricule, formData.password);
            if (data.success) {
                // Pas besoin de stocker le token
                setTimeout(() => navigate('/'), 0);
            } else {
                // Messages d'erreur plus spécifiques
                if (data.message?.includes('401') || data.message?.includes('Unauthorized')) {
                    setError('Matricule ou mot de passe incorrect');
                    setErrorType('error');
                    setShowError(true);
                } else if (data.message?.includes('403') || data.message?.includes('Forbidden')) {
                    setError('Accès refusé. Vérifiez vos permissions');
                    setErrorType('error');
                    setShowError(true);
                } else if (data.message?.includes('404')) {
                    setError('Utilisateur non trouvé');
                    setErrorType('error');
                    setShowError(true);
                } else if (data.message?.includes('500')) {
                    setError('Erreur serveur. Veuillez réessayer plus tard');
                    setErrorType('error');
                    setShowError(true);
                } else {
                    setError(data.message || 'Échec de la connexion');
                    setErrorType('error');
                    setShowError(true);
                }
            }
        } catch (error: any) {
            // Messages d'erreur réseau plus informatifs
            if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet');
                setErrorType('error');
                setShowError(true);
            } else if (error.message?.includes('timeout')) {
                setError('Délai d\'attente dépassé. Le serveur met trop de temps à répondre');
                setErrorType('warning');
                setShowError(true);
            } else {
                setError(error.message || 'Une erreur inattendue s\'est produite');
                setErrorType('error');
                setShowError(true);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <>
            <div className={`min-h-screen transition-all duration-500 ${
                isDarkMode
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900'
                    : 'bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50'
            } flex items-center justify-center p-4 relative overflow-hidden`}>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="absolute top-6 right-6 p-3 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-primary-200/30 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 z-20 group"
                >
                    {isDarkMode ? (
                        <Sun className="h-5 w-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                    ) : (
                        <Moon className="h-5 w-5 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
                    )}
                </button>

                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className={`absolute top-20 left-20 w-32 h-32 ${
                        isDarkMode ? 'bg-primary-500/20' : 'bg-primary-200/30'
                    } rounded-full blur-xl animate-float`}></div>
                    <div className={`absolute top-40 right-32 w-24 h-24 ${
                        isDarkMode ? 'bg-secondary-500/25' : 'bg-secondary-200/40'
                    } rounded-full blur-xl animate-float`} style={{animationDelay: '1s'}}></div>
                    <div className={`absolute bottom-32 left-40 w-28 h-28 ${
                        isDarkMode ? 'bg-accent-500/20' : 'bg-accent-200/35'
                    } rounded-full blur-xl animate-float`} style={{animationDelay: '2s'}}></div>
                    <div className={`absolute bottom-20 right-20 w-20 h-20 ${
                        isDarkMode ? 'bg-primary-400/15' : 'bg-primary-300/25'
                    } rounded-full blur-xl animate-float`} style={{animationDelay: '0.5s'}}></div>
                </div>

                {/* Geometric Background Pattern */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>

                {/* Main Login Container */}
                <div className="relative w-full max-w-md animate-slide-up">
                    {/* Login Card */}
                    <div className={`${
                        isDarkMode
                            ? 'bg-gray-800/90 border-gray-700/50'
                            : 'bg-white/95 border-primary-100/50'
                    } backdrop-blur-lg rounded-3xl shadow-2xl border p-8 animate-scale-in relative overflow-hidden transition-all duration-500`}>

                        {/* Card Background Glow */}
                        <div className={`absolute inset-0 ${
                            isDarkMode
                                ? 'bg-gradient-to-br from-gray-800/50 to-primary-900/30'
                                : 'bg-gradient-to-br from-primary-50/50 to-secondary-50/50'
                        } rounded-3xl transition-all duration-500`}></div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Logo and Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-xl animate-pulse-glow relative">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        viewBox="0 0 24 24"
                                        className="animate-float"
                                    >
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent mb-3 animate-fade-in">
                                    JobVision
                                </h1>
                                <p className={`${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                } text-sm animate-fade-in transition-colors duration-500`} style={{animationDelay: '0.2s'}}>
                                    Connectez-vous à votre espace de travail
                                </p>
                            </div>

                            {/* Error Message Display */}
                            {showError && error && (
                                <div className={`mb-4 p-4 rounded-xl border-l-4 animate-slide-down ${
                                    errorType === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                                        : errorType === 'warning'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                } transition-all duration-300`}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className={`h-5 w-5 ${
                                                errorType === 'error'
                                                    ? 'text-red-500'
                                                    : errorType === 'warning'
                                                        ? 'text-yellow-500'
                                                        : 'text-blue-500'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-5">
                                                {error}
                                            </p>
                                            {errorType === 'error' && (
                                                <p className="mt-1 text-xs opacity-75">
                                                    Vérifiez vos identifiants et réessayez
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={clearError}
                                            className={`flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                                                errorType === 'error'
                                                    ? 'text-red-400 hover:text-red-600'
                                                    : errorType === 'warning'
                                                        ? 'text-yellow-400 hover:text-yellow-600'
                                                        : 'text-blue-400 hover:text-blue-600'
                                            }`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Matricule Field */}
                                <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
                                    <label htmlFor="matricule" className={`block text-sm font-semibold ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    } transition-colors duration-500`}>
                                        Matricule
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                            <User className={`h-5 w-5 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                            } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                        </div>
                                        <input
                                            type="text"
                                            id="matricule"
                                            name="matricule"
                                            value={formData.matricule}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-4 border-2 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                    : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                            placeholder="Votre matricule"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
                                    <label htmlFor="password" className={`block text-sm font-semibold ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    } transition-colors duration-500`}>
                                        Mot de passe
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                            <Lock className={`h-5 w-5 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                            } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-14 py-4 border-2 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                    : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                            placeholder="Votre mot de passe"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className={`absolute inset-y-0 right-0 pr-4 flex items-center ${
                                                isDarkMode ? 'text-gray-400 hover:text-primary-400' : 'text-gray-400 hover:text-primary-600'
                                            } transition-all duration-200 hover:scale-110`}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>


                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 px-6 rounded-xl font-semibold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-fade-in relative overflow-hidden group"
                                    style={{
                                        animationDelay: '0.6s',
                                        backgroundSize: '200% 100%'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center relative z-10">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            <span className="animate-pulse">Connexion en cours...</span>
                                        </div>
                                    ) : (
                                        <span className="relative z-10">Se connecter</span>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="mt-8 relative animate-fade-in" style={{animationDelay: '0.7s'}}>
                                <div className="absolute inset-0 flex items-center">
                                    <div className={`w-full border-t ${
                                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                    } transition-colors duration-500`}></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${
                    isDarkMode ? 'bg-gray-800/90 text-gray-400' : 'bg-white/90 text-gray-500'
                } font-medium transition-colors duration-500`}>ou</span>
                                </div>
                            </div>

                            {/* Sign Up Button */}
                            <div className="mt-6 animate-fade-in" style={{animationDelay: '0.8s'}}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className={`w-full ${
                                        isDarkMode
                                            ? 'bg-gray-700/80 text-primary-400 border-gray-600 hover:bg-gray-600/80 hover:border-primary-500 hover:text-primary-300'
                                            : 'bg-white/80 text-primary-600 border-primary-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700'
                                    } py-4 px-6 rounded-xl font-semibold border-2 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl relative overflow-hidden group`}
                                >
                                    <div
                                        className={`absolute inset-0 ${
                                            isDarkMode
                                                ? 'bg-gradient-to-r from-gray-600/0 via-gray-600/30 to-gray-600/0'
                                                : 'bg-gradient-to-r from-primary-50/0 via-primary-50/50 to-primary-50/0'
                                        } -translate-x-full group-hover:translate-x-full transition-transform duration-500`}
                                    ></div>
                                    <span className="relative z-10">Créer un compte</span>
                                </button>
                            </div>

                            {/* Footer */}
                            <div className={`mt-8 text-center text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            } animate-fade-in transition-colors duration-500`} style={{animationDelay: '0.9s'}}>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse"></div>
                                    <span>© 2025 JobFlow. Tous droits réservés.</span>
                                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;