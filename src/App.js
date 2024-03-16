import logo from './logo.svg';
import './App.css';
import SignIn from './components/auth/SignIn.jsx';
import SignUp from './components/auth/SignUp.jsx';
import AuthDetails from './components/auth/AuthDetails.jsx';
import PutItem from './components/data/PutItem.jsx';
import GetItem from './components/data/GetItem.jsx';

function App() {
  return (
    <div className="App">
      <SignIn/>
      <SignUp/>
      <AuthDetails/>
      <PutItem/>
      <GetItem/>
    </div>
  );
}

export default App;
