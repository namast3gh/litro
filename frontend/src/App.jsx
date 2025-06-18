import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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

const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = '8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0';

function useUmamiTracker() {
  const location = useLocation();

  useEffect(() => {
    // Добавляем скрипт Umami, если он ещё не добавлен
    if (!document.querySelector(`script[src="${UMAMI_SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.src = UMAMI_SCRIPT_URL;
      script.defer = true;
      script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
      document.body.appendChild(script);
    }

    // Вызываем трекинг просмотра страницы при смене маршрута
    if (window.umami) {
      window.umami.trackView(location.pathname);
    }
  }, [location]);
}

function AppContent() {
  useUmamiTracker();

  return (
    <>
      <Header />
      <nav className="bg-gray-100 p-4">
        {/* Навигация (если нужно) */}
      </nav>
      <main className="flex-grow">
        <Routes>
          {/* Ваши маршруты */}
          <Route path="/authors" element={<AuthorsList />} />
          <Route path="/books" element={<BooksList />} />
          <Route path="/comments" element={<CommentsList />} />
          <Route path="/genres" element={<GenresList />} />
          {/* <Route path="/user_authors" element={<UserAuthorsList />} /> */}
          <Route path="/users" element={<UsersList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload-book" element={<UploadBook />} />
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
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
