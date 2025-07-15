import React, { useState } from 'react';
import Login from './components/Login';
import WheelOfLife from './components/WheelOfLife';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: 24 }}>Wheel of Life App</h1>
      {!user ? (
        <Login onUserChanged={setUser} />
      ) : (
        <>
          <Login onUserChanged={setUser} />
          <WheelOfLife user={user} />
        </>
      )}
    </div>
  );
} 