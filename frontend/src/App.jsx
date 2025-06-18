import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import AuthorsList from './components/AuthorsList';

import CommentsList from './components/CommentsList';
import GenresList from './components/GenresList';
import GroupsList from './components/GroupsList';
// import UserAuthorsList from './components/UserAuthorsList';
import UsersList from './components/UsersList';

import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './components/Profile';
import UploadBook from './components/UploadBook';

import BooksList from './components/BooksList';
import BookDetail from './components/BookDetail';
import Cart from './components/Cart';

import FreeBooks from './components/FreeBooks';
import TopBooks from './components/TopBooks';

import FaqRegister from './components/FaqRegister';
import FaqUploadBook from './components/FaqUploadBook';
import FaqContactAuthor from './components/FaqContactAuthor';
import FaqEditProfile from './components/FaqEditProfile';

import Help from './components/Help';
import About from './components/About';

import UploadBookAdmin from './components/UploadBookAdmin';
import AddGenreAdmin from './components/AddGenreAdmin';
import Report from './components/Report';
import Statistics from './components/Statistics';

function MainStats() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-2xl font-bold">840 000</div>
          <div className="text-gray-600">книг</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">🎧</div>
          <div className="text-2xl font-bold">440 000</div>
          <div className="text-gray-600">аудиокниг</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-2xl font-bold">+ 2 000</div>
          <div className="text-gray-600">новинок каждый месяц</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">📱</div>
          <div className="text-2xl font-bold">Оффлайн</div>
          <div className="text-gray-600">или онлайн</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <nav className="bg-gray-100 p-4">
          {/* <Link to="/" className="mr-4">Главная</Link>
          <Link to="/authors" className="mr-4">Авторы</Link>
          <Link to="/books" className="mr-4">Книги</Link>
          <Link to="/comments" className="mr-4">Комментарии</Link>
          <Link to="/genres" className="mr-4">Жанры</Link>
          <Link to="/groups" className="mr-4">Группы</Link>
          <Link to="/cart" className="mr-4">Корзина</Link>
          {/* <Link to="/user_authors" className="mr-4">User Authors</Link> */}
          {/* <Link to="/users" className="mr-4">Пользователи</Link>
          <Link to="/profile" className="mr-4">Мой профиль</Link> */}
        </nav>
        <main className="flex-grow">
          <Routes>
            {/* <Route path="/" element={<MainStats />} /> */}
            <Route path="/authors" element={<AuthorsList />} />
            <Route path="/books" element={<BooksList />} />
            <Route path="/comments" element={<CommentsList />} />
            <Route path="/genres" element={<GenresList />} />
            {/* <Route path="/user_authors" element={<UserAuthorsList />} /> */}
            <Route path="/users" element={<UsersList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload-book" element={<UploadBook />} /> {/* Добавлен маршрут */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/" element={<BooksList />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/free" element={<FreeBooks />} />
            <Route path="/top" element={<TopBooks />} />
            <Route path="/groups" element={<GroupsList />} /> 
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route path="/faq/register" element={<FaqRegister />} />
            <Route path="/faq/upload-book" element={<FaqUploadBook />} />
            <Route path="/faq/contact-author" element={<FaqContactAuthor />} />
            <Route path="/faq/edit-profile" element={<FaqEditProfile />} />
            <Route path="/upload-book-admin" element={<UploadBookAdmin />} />
            <Route path="/add-genre-admin" element={<AddGenreAdmin />} />
            <Route path="/report" element={<Report />} />
            <Route path="/statistics" element={<Statistics />} />

            <Route path="*" element={<h2 className="p-8 text-center">Страница не найдена</h2>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
