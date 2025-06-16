import React, { useEffect, useState } from 'react';
import api from '../api';

function Page2() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/page2').then(response => setData(response.data.page));
  }, []);

  return (
    <div>
      <h1>Page 2</h1>
      <p>{data}</p>
    </div>
  );
}

export default Page2;