import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Помощь</h1>
      <p className="mb-4 text-lg leading-relaxed">
        Если у вас возникли вопросы или проблемы при использовании платформы LITRO, мы всегда готовы помочь!
      </p>
      <h2 className="text-xl font-semibold mb-2">Часто задаваемые вопросы</h2>
      <ul className="list-disc list-inside mb-6 text-lg space-y-2">
        <li>
          <Link to="/faq/register" className="text-orange-500 hover:underline">
            Как зарегистрироваться и войти в аккаунт?
          </Link>
        </li>
        <li>
          <Link to="/faq/upload-book" className="text-orange-500 hover:underline">
            Как загрузить свою книгу?
          </Link>
        </li>
        <li>
          <Link to="/faq/contact-author" className="text-orange-500 hover:underline">
            Как связаться с автором?
          </Link>
        </li>
        <li>
          <Link to="/faq/edit-profile" className="text-orange-500 hover:underline">
            Как изменить личные данные?
          </Link>
        </li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">Связаться с поддержкой</h2>
      <p className="mb-2 text-lg">
        Если вы не нашли ответ на свой вопрос, напишите нам или позвоните:
      </p>
      <ul className="mb-6 text-lg">
        <li><strong>Электронная почта:</strong> <a href="mailto:support@litro.ru" className="text-orange-500 hover:underline">support@litro.ru</a></li>
        <li><strong>Горячая линия:</strong> <a href="tel:+88003332737" className="text-orange-500 hover:underline">8 800 333 27 37</a></li>
      </ul>
      <p className="text-lg leading-relaxed">
        Мы ценим каждого пользователя и сделаем всё, чтобы ваше взаимодействие с LITRO было максимально комфортным.
      </p>
    </main>
  );
};

export default Help;
