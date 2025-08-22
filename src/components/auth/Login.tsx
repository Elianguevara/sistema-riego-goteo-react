import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            await authService.login(username, password);
            console.log('Login exitoso, redirigiendo...');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error en el login:', error);
            // Esta es la lógica modificada para mostrar el mensaje correcto
            if (error instanceof Error && error.message === "USER_DISABLED") {
                setErrorMessage('Tu usuario está deshabilitado. Contacta al administrador.');
            } else {
                setErrorMessage('Usuario o contraseña incorrectos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <i className="fas fa-leaf logo-icon"></i>
                    <h1 className="title">Hidra</h1>
                    <h2 className="subtitle">Sistema de Gestión de Riego</h2>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="username-input" className="visually-hidden">Nombre de usuario</label>
                        <i className="fas fa-user icon"></i>
                        <input
                            id="username-input"
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password-input" className="visually-hidden">Contraseña</label>
                        <i className="fas fa-lock icon"></i>
                        <input
                            id="password-input"
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <i
                            className={`fas ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                            onClick={togglePasswordVisibility}
                        ></i>
                    </div>

                    {errorMessage && (
                        <div className="error-message server-error">
                            {errorMessage}
                        </div>
                    )}

                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
        </div>
    );
};

export default Login;