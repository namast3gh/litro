import React, { useEffect, useState } from 'react';
import api from '../api';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/data/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка при загрузке пользователей');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка пользователей...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Пользователи</h2>
      {users.length === 0 ? (
        <p>Пользователи не найдены.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.username} ({user.email}), Role ID: {user.id_role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsersList;
