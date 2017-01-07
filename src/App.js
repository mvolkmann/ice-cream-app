import React, {Component} from 'react';
import Login from './login';
import Main from './main';
import 'whatwg-fetch';
import './App.css';

class App extends Component {
  constructor() {
    super();
    window.setState = newState => {
      console.log('App.js setState: newState =', newState);
      this.setState(newState);
    };
  }

  state = {
    authenticated: false,
    error: '',
    route: 'login'
  };

  logout = () => {
    this.setState({route: 'login'});
  };

  render() {
    const {error, route} = this.state;

    return (
      <div className="App">
        <header>
          <img className="header-img" src="ice-cream.png" alt="ice cream"/>
          Ice cream, we all scream for it!
          <button onClick={this.logout}>Log out</button>
        </header>
        <div className="App-body">
          {
            error ? <div className="error">{error}</div> : null
          }
          {
            route === 'login' ? <Login/> :
            route === 'main' ? <Main/> :
            <div>Unknown route {route}</div>
          }

        </div>
      </div>
    );
  }
}

export default App;
