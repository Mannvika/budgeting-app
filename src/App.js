import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import SignIn from './components/auth/SignIn.jsx';
import SignUp from './components/auth/SignUp.jsx';
import AuthDetails from './components/auth/AuthDetails.jsx';
import PutItem from './components/data/PutItem.jsx';
import GetItem from './components/data/GetItem.jsx';
import { auth } from './firebase';

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
          <AuthDetails/>
          <PutItem/>
          <GetItem/>
        </>
      )}
    </div>
  );
}

export default App;
