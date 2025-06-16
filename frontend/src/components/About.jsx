import React from 'react';

const About = () => {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Что такое LITRO</h1>
      <p className="mb-4 text-lg leading-relaxed">
        LITRO — это инновационная онлайн-платформа для любителей книг, авторов и издателей. Мы объединяем читателей и создателей контента, предоставляя удобный доступ к книгам в различных жанрах.
      </p>
      <p className="mb-4 text-lg leading-relaxed">
        Наша миссия — сделать чтение доступным и увлекательным для каждого, поддерживая авторов и стимулируя развитие литературного сообщества.
      </p>
      <p className="mb-4 text-lg leading-relaxed">
        На LITRO вы можете:
      </p>
      <ul className="list-disc list-inside mb-4 text-lg">
        <li>Искать и читать книги онлайн</li>
        <li>Обсуждать произведения с другими читателями</li>
        <li>Загружать свои собственные книги и делиться ими с миром</li>
      </ul>
      <p className="text-lg leading-relaxed">
        Присоединяйтесь к LITRO и погрузитесь в мир литературы вместе с нами!
      </p>
    </main>
  );
};

export default About;
