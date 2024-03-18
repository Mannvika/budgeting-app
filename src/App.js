import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import SignIn from './components/auth/SignIn.jsx';
import SignUp from './components/auth/SignUp.jsx';
import AuthDetails from './components/auth/AuthDetails.jsx';
import './fonts/RobotoSlab-Regular.ttf';
import './fonts/RobotoSlab-Bold.ttf';
import { auth } from './firebase';
import Dashboard from './components/data/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  var data = []

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); 
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {!user && (
        <>
          <SignIn/>
          <SignUp/>
        </>
      )}
      {user && (
        <>
          <Dashboard/>
        </>
      )}
    </div>
  );
}

export default App;
