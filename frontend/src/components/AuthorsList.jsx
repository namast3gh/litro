import React, { useEffect, useState } from 'react';
import api from '../api';

function AuthorsList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/data/authors')
      .then(response => {
        setAuthors(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка при загрузке авторов');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка авторов...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Авторы</h2>
      {authors.length === 0 ? (
        <p>Авторы не найдены.</p>
      ) : (
        <ul>
          {authors.map(author => (
            <li key={author.id}>{author.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AuthorsList;
