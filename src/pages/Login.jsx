import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Card from '../components/ui/Card';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export default function Login() {
    const [loginType, setLoginType] = useState('student'); // 'student' | 'admin'
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            const endpoint = loginType === 'student' ? '/api/auth/login' : '/api/auth/admin/login';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            console.log('Login Success:', result);
            localStorage.setItem('userInfo', JSON.stringify(result));

            if (loginType === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login Error:', error);
            setError('root', {
                type: 'manual',
                message: error.message
            });
            // Also set a generic field error to make it visible if root error isn't displayed
            setError('password', {
                type: 'manual',
                message: error.message
            });
        }
    };

    const toggleLoginType = (type) => {
        setLoginType(type);
        reset(); // Clear form on toggle
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <Icons.Rocket size={40} className="text-primary" />
                        <span className="text-3xl font-bold text-secondary">Edinz<span className="text-primary">Tech</span></span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/" className="font-medium text-secondary hover:text-primary transition-colors">
                        return to home
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 sm:rounded-lg sm:px-10 shadow-lg border-t-4 border-primary">
                    <div className="flex mb-6 border-b border-gray-200">
                        <button
                            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${loginType === 'student'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => toggleLoginType('student')}
                        >
                            Student Login
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${loginType === 'admin'
                                ? 'border-b-2 border-secondary text-secondary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => toggleLoginType('admin')}
                        >
                            Admin Login
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <Input
                                label="Email address"
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder={loginType === 'student' ? "student@example.com" : "admin@edinztech.com"}
                                {...register('email')}
                                error={errors.email?.message}
                            />
                        </div>

                        <div>
                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                {...register('password')}
                                error={errors.password?.message}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-secondary hover:text-primary transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-3"
                                isLoading={isSubmitting}
                                variant={loginType === 'admin' ? 'secondary' : 'primary'}
                            >
                                {loginType === 'student' ? 'Sign in as Student' : 'Sign in as Admin'}
                            </Button>
                        </div>
                    </form>

                    {loginType === 'admin' && (
                        <div className="mt-6 p-3 bg-blue-50 rounded-md text-xs text-secondary flex items-start gap-2">
                            <Icons.Info size={16} className="shrink-0 mt-0.5" />
                            <p>Admin access allows you to manage programs, quizzes, and certificates. Please ensure you have authorized credentials.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}