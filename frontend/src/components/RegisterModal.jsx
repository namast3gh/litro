import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import api from '../api';

const USER_AGREEMENT_TEXT = `

Пользовательское Соглашение
1. Общие положения
Настоящее Пользовательское Соглашение (Далее Соглашение) регулирует отношения между LITRO (далее LITRO или Администрация) с одной стороны и пользователем сайта с другой.
Сайт LITRO не является средством массовой информации.

Используя сайт LITRO, Вы соглашаетесь с условиями данного соглашения.
Если Вы не согласны с условиями данного соглашения, не используйте сайт LITRO!

2. Права и обязанности сторон
Пользователь имеет право:
- осуществлять поиск информации на сайте
- получать информацию на сайте
- создавать информацию на сайте
- распространять информацию на сайте с других источников
- комментировать и давать отзыв на публикации
- изменять рейтинг других пользователей
- Копировать информацию на другие сайты запрещено.
- требовать от администрации скрытия любой информации о себе
- использовать информацию сайта для личных некоммерческих целей

Администрация имеет право:
- по своему усмотрению и необходимости создавать, изменять, отменять правила
- ограничивать доступ к любой информации на сайте
- по своему усмотрению и необходимости создавать, изменять, удалять информацию на сайте
- удалять учетные записи пользователей без объяснения причины

Пользователь обязуется:
- обеспечить достоверность предоставляемой информации
- обеспечивать сохранность личных данных от доступа третьих лиц
- обновлять Персональные данные, предоставленные при регистрации, в случае их изменения
- не копировать информацию с других источников
- не распространять информацию, которая направлена на пропаганду войны, разжигание национальной, расовой или религиозной ненависти и вражды, а также иной информации, за распространение которой предусмотрена уголовная или административная ответственность
- не нарушать работоспособность сайта
- не совершать действия, направленные на введение других Пользователей в заблуждение
- не передавать в пользование свою учетную запись и/или логин и пароль своей учетной записи третьим лицам
- не размещать материалы рекламного, эротического, порнографического или оскорбительного характера, а также иную информацию, размещение которой запрещено или противоречит нормам действующего законодательства РФ
- не использовать скрипты (программы) для автоматизированного сбора информации и/или взаимодействия с Сайтом и его Сервисами

Администрация обязуется:
- поддерживать работоспособность сайта
- осуществлять разностороннюю защиту учетной записи Пользователя
- защищать информацию, распространение которой ограничено или запрещено законами путем вынесения предупреждения либо удалением учетной записи пользователя, нарушившего правила
- предоставить всю доступную информацию о Пользователе уполномоченным на то органам государственной власти в случаях, установленных законом

Ответственность сторон
- администрация не несёт ответственность за несовпадение ожидаемых Пользователем и реально полученных услуг
- администрация не несет никакой ответственности за услуги, предоставляемые третьими лицами
- в случае возникновения форс-мажорной ситуации (боевые действия, чрезвычайное положение, стихийное бедствие и т. д.) Администрация не гарантирует сохранность информации, размещённой Пользователем, а также бесперебойную работу информационного ресурса

Условия действия Соглашения
Данное Соглашение вступает в силу только после регистрации на сайте.
Данное Соглашение перестает действовать при появлении его новой версии.
Администрация оставляет за собой право в одностороннем порядке изменять данное соглашение по своему усмотрению.
Администрация не оповещает пользователей об изменении в Соглашении.


Соглашение разработано c помощью сервиса Компьюти

Дата последнего изменения пользовательского соглашения: 01.01.2025
`;

const AUTHOR_AGREEMENT_TEXT = `
Договор Автора

1. Автор подтверждает, что все предоставленные материалы являются его собственным творчеством и не нарушают права третьих лиц.
2. Автор предоставляет сайту LITRO неисключительное право на использование, распространение и публикацию его материалов.
3. Автор обязуется не размещать материалы, нарушающие законодательство РФ и нормы морали.
4. Администрация сайта оставляет за собой право удалять материалы, нарушающие данный договор, без предварительного уведомления.
5. Автор несет ответственность за достоверность и законность размещаемых материалов.

Дата последнего обновления договора: 01.01.2025
`;

const RegisterModal = ({ isOpen, onClose, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [agree, setAgree] = useState(false);
  const [authorAgree, setAuthorAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [authorAgreementOpen, setAuthorAgreementOpen] = useState(false);

  const roleMap = {
    admin: 1,
    user: 2,
    author: 4,
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (e.target.value !== 'author') {
      setAuthorAgree(false);
    }
  };

  const validate = () => {
    if (!agree) {
      setError('Вы должны принять пользовательское соглашение');
      return false;
    }
    if (role === 'author' && !authorAgree) {
      setError('Вы должны принять договор автора');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (username.length < 3 || username.length > 50) {
      setError('Имя пользователя должно быть от 3 до 50 символов');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (role === 'author' && name.trim() === '') {
      setError('Пожалуйста, укажите ФИО');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccessMessageVisible(false);

    try {
      const payload = {
        username,
        email,
        password,
        id_role: roleMap[role],
      };
      if (role === 'author') {
        payload.name = name;
        payload.biography = biography;
      }
      await api.post('/auth/register', payload);

      // Не логиним автоматически, а показываем сообщение об успехе
      setSuccessMessageVisible(true);

      // Очистка полей (по желанию)
      setEmail('');
      setUsername('');
      setName('');
      setBiography('');
      setPassword('');
      setConfirmPassword('');
      setAgree(false);
      setAuthorAgree(false);
      setRole('user');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Ошибка регистрации';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <div className="flex items-center justify-center min-h-screen px-4 relative">
          <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded shadow-lg z-10 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">Регистрация</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Имя пользователя:</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">От 3 до 50 символов</p>
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label>Пароль:</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Минимум 6 символов</p>
              </div>
              <div>
                <label>Подтвердите пароль:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label>Выберите роль:</label>
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="user">Читатель</option>
                  <option value="author">Автор</option>
                </select>
              </div>
              {role === 'author' && (
                <>
                  <div>
                    <label>ФИО:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label>О себе:</label>
                    <textarea
                      value={biography}
                      onChange={e => setBiography(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div className="flex items-start mt-4">
                    <input
                      id="authorAgreement"
                      type="checkbox"
                      checked={authorAgree}
                      onChange={e => setAuthorAgree(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="authorAgreement" className="ml-2 text-sm text-gray-700">
                      Я принимаю{' '}
                      <button
                        type="button"
                        onClick={() => setAuthorAgreementOpen(true)}
                        className="text-orange-500 underline hover:text-orange-600"
                      >
                        договор автора
                      </button>
                    </label>
                  </div>
                </>
              )}
              <div className="flex items-start mt-4">
                <input
                  id="agreement"
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="agreement" className="ml-2 text-sm text-gray-700">
                  Я принимаю{' '}
                  <button
                    type="button"
                    onClick={() => setAgreementOpen(true)}
                    className="text-orange-500 underline hover:text-orange-600"
                  >
                    пользовательское соглашение
                  </button>
                </label>
              </div>
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}

              {/* Здесь выводим сообщение об успешной регистрации */}
              {successMessageVisible && (
                <div className="text-green-600 text-center mt-4 font-semibold">
                  Успешная регистрация! Войдите в аккаунт.
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !agree || (role === 'author' && !authorAgree)}
                className={`w-full py-2 px-4 rounded text-white ${
                  loading || !agree || (role === 'author' && !authorAgree)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => {
                  onClose();
                  onLoginClick();
                }}
                className="text-orange-500 hover:underline"
              >
                Войти
              </button>
            </p>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Модальные окна пользовательского соглашения и договора автора */}

      <Dialog open={agreementOpen} onClose={() => setAgreementOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <div className="flex items-center justify-center min-h-screen px-4 relative">
          <Dialog.Panel className="w-full max-w-3xl p-6 bg-white rounded shadow-lg z-10 overflow-y-auto max-h-[80vh]">
            <Dialog.Title className="text-xl font-semibold mb-4">Пользовательское Соглашение</Dialog.Title>
            <div className="whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto max-h-[60vh]">
              {USER_AGREEMENT_TEXT}
            </div>
            <button
              onClick={() => setAgreementOpen(false)}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Закрыть
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={authorAgreementOpen} onClose={() => setAuthorAgreementOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <div className="flex items-center justify-center min-h-screen px-4 relative">
          <Dialog.Panel className="w-full max-w-3xl p-6 bg-white rounded shadow-lg z-10 overflow-y-auto max-h-[80vh]">
            <Dialog.Title className="text-xl font-semibold mb-4">Договор Автора</Dialog.Title>
            <div className="whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto max-h-[60vh]">
              {AUTHOR_AGREEMENT_TEXT}
            </div>
            <button
              onClick={() => setAuthorAgreementOpen(false)}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Закрыть
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default RegisterModal;
