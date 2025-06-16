import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import api from '../api';

const LoginModal = ({ isOpen, onClose, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });

      const userWithToken = {
        ...response.data.user,
        access_token: response.data.access_token,
      };

      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', response.data.access_token);

      onClose();
      window.location.href = '/';
    } catch (error) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
      <div className="flex items-center justify-center min-h-screen px-4 relative">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded shadow-lg z-10">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">Вход</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Почта или телефон:</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Пароль:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              onClick={() => {
                onClose();
                onRegisterClick();
              }}
              className="text-orange-500 hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;
