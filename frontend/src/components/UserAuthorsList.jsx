import React, { useEffect, useState } from 'react';
import api from '../api';

function UserAuthorsList() {
  const [userAuthors, setUserAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/data/user_authors')
      .then(response => {
        setUserAuthors(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка при загрузке user_authors');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка user_authors...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>User Authors</h2>
      {userAuthors.length === 0 ? (
        <p>User Authors не найдены.</p>
      ) : (
        <ul>
          {userAuthors.map(ua => (
            <li key={ua.id}>
              {ua.username} ({ua.email}), Role ID: {ua.id_role}, Book ID: {ua.id_book} Biography: {ua.biography}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserAuthorsList;
