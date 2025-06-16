import React, { useEffect, useState } from 'react';
import api from '../api';

function GenresList() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/data/genres')
      .then(response => {
        setGenres(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка при загрузке жанров');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка жанров...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Жанры</h2>
      {genres.length === 0 ? (
        <p>Жанры не найдены.</p>
      ) : (
        <ul>
          {genres.map(genre => (
            <li key={genre.id}>{genre.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GenresList;
