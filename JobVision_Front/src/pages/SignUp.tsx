import React, { useEffect, useState } from 'react';
import {Eye, EyeOff, User, Lock, Mail, Moon, Sun, UserPlus, UserCircle, ChevronRight, ChevronLeft} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {createUser} from "../api/authApi.ts";

const SignUp = () => {
    useEffect(() => {
        document.title = 'Inscription - JobVision';
    }, []);

    const [formData, setFormData] = useState({
        matricule: '',
        email: '',
        password: '',
        name:'',
        lastname:'',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [error, setError] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('jwt')) {
            navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);
        try {
            await createUser({
                matricule: formData.matricule,
                password: formData.password,
                email: formData.email,
                name:formData.name,
                lastname:formData.lastname,
                idRole: 1,
                idService: 1
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.message || "Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const nextTab = () => {
        if (currentTab < 2) {
            setCurrentTab(currentTab + 1);
        }
    };

    const prevTab = () => {
        if (currentTab > 0) {
            setCurrentTab(currentTab - 1);
        }
    };

    const canProceedToNext = () => {
        switch (currentTab) {
            case 0:
                return formData.name && formData.lastname;
            case 1:
                return formData.matricule && formData.email;
            case 2:
                return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
            default:
                return false;
        }
    };

    const tabs = [
        {
            id: 0,
            title: "Informations personnelles",
            subtitle: "Vos nom et prénom",
            icon: <User className="h-5 w-5" />
        },
        {
            id: 1,
            title: "Identifiants",
            subtitle: "Matricule et email",
            icon: <UserCircle className="h-5 w-5" />
        },
        {
            id: 2,
            title: "Sécurité",
            subtitle: "Mot de passe",
            icon: <Lock className="h-5 w-5" />
        }
    ];

    return (
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

            {/* Main SignUp Container */}
            <div className="relative w-full max-w-2xl animate-slide-up">
                {/* SignUp Card */}
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
                                Créez votre compte en quelques étapes
                            </p>
                        </div>

                        {/* Progress Tabs */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                {tabs.map((tab, index) => (
                                    <div key={tab.id} className="flex items-center">
                                        <div className={`flex items-center space-x-2 ${
                                            currentTab >= tab.id ? 'text-primary-600' : 'text-gray-400'
                                        } transition-colors duration-300`}>
                                            <div className={`p-2 rounded-full ${
                                                currentTab >= tab.id 
                                                    ? 'bg-primary-100 dark:bg-primary-900/50' 
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                            } transition-all duration-300`}>
                                                {tab.icon}
                                            </div>
                                            <div className="hidden sm:block">
                                                <p className="text-sm font-medium">{tab.title}</p>
                                                <p className="text-xs text-gray-500">{tab.subtitle}</p>
                                            </div>
                                        </div>
                                        {index < tabs.length - 1 && (
                                            <div className={`w-8 h-0.5 mx-2 ${
                                                currentTab > tab.id ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                            } transition-colors duration-300`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        {/* SignUp Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Tab 1: Personal Information */}
                            {currentTab === 0 && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="space-y-2">
                                        <label htmlFor="firstname" className={`block text-sm font-semibold ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                        } transition-colors duration-500`}>
                                            Prénom
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                                <User className={`h-5 w-5 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                                } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                            </div>
                                            <input
                                                type="text"
                                                id="firstname"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full pl-12 pr-4 py-3 border-2 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                        : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                                placeholder="Votre prénom"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="lastname" className={`block text-sm font-semibold ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                        } transition-colors duration-500`}>
                                            Nom
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                                <UserCircle className={`h-5 w-5 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                                } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                            </div>
                                            <input
                                                type="text"
                                                id="lastname"
                                                name="lastname"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
                                                className={`w-full pl-12 pr-4 py-3 border-2 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                        : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                                placeholder="Votre nom"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Credentials */}
                            {currentTab === 1 && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="space-y-2">
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
                                                className={`w-full pl-12 pr-4 py-3 border-2 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                        : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                                placeholder="Votre matricule"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className={`block text-sm font-semibold ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                        } transition-colors duration-500`}>
                                            Email
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                                <Mail className={`h-5 w-5 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                                } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-12 pr-4 py-3 border-2 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                        : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                                placeholder="votre.email@exemple.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Security */}
                            {currentTab === 2 && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="space-y-2">
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
                                                className={`w-full pl-12 pr-14 py-3 border-2 ${
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

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className={`block text-sm font-semibold ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                        } transition-colors duration-500`}>
                                            Confirmer le mot de passe
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                                                <Lock className={`h-5 w-5 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                                } group-focus-within:text-primary-500 transition-colors duration-200`} />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`w-full pl-12 pr-14 py-3 border-2 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700/70 text-white placeholder-gray-400 hover:border-primary-400 hover:bg-gray-700/90 focus:border-primary-500'
                                                        : 'border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 hover:border-primary-300 hover:bg-white/90 focus:border-primary-500'
                                                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300`}
                                                placeholder="Confirmez votre mot de passe"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className={`absolute inset-y-0 right-0 pr-4 flex items-center ${
                                                    isDarkMode ? 'text-gray-400 hover:text-primary-400' : 'text-gray-400 hover:text-primary-600'
                                                } transition-all duration-200 hover:scale-110`}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={prevTab}
                                    disabled={currentTab === 0}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                        currentTab === 0
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Précédent</span>
                                </button>

                                {currentTab < 2 ? (
                                    <button
                                        type="button"
                                        onClick={nextTab}
                                        disabled={!canProceedToNext()}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            canProceedToNext()
                                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Suivant</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isLoading || !canProceedToNext()}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                        style={{
                                            backgroundSize: '200% 100%'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        {isLoading ? (
                                            <div className="flex items-center justify-center relative z-10">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                <span className="animate-pulse">Inscription...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center relative z-10">
                                                <UserPlus className="h-5 w-5 mr-2" />
                                                <span>Créer mon compte</span>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="mt-8 relative animate-fade-in" style={{animationDelay: '0.8s'}}>
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

                        {/* Login Button */}
                        <div className="mt-6 animate-fade-in" style={{animationDelay: '0.9s'}}>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
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
                                <span className="relative z-10">J'ai déjà un compte</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className={`mt-8 text-center text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } animate-fade-in transition-colors duration-500`} style={{animationDelay: '1s'}}>
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
    );
};

export default SignUp;