import React, { useEffect, useState } from 'react';
import api from '../api';

function Page1() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/page1').then(response => setData(response.data.page));
  }, []);

  return (
    <div>
      <h1>Page 11111</h1>
      <p>{data}</p>
    </div>
  );
}

export default Page1; 