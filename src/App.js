import React, {Component} from 'react';
import Login from './login';
import Main from './main';
import 'whatwg-fetch';
import './App.css';

/* eslint-disable no-invalid-this */
class App extends Component {
  constructor() {
    super();
    window.setState = newState => this.setState(newState);
  }

  state = {
    authenticated: false,
    error: '',
    flavor: '',
    password: '',
    route: 'login',
    username: ''
  };

  logout = () => {
    this.setState({route: 'login'});
  };

  render() {
    const {error, flavor, password, route, username} = this.state;

    return (
      <div className="App">
        <header>
          <img className="header-img" src="ice-cream.png" alt="ice cream"/>
          Ice cream, we all scream for it!
          {
            username ?
              <button onClick={this.logout}>Log out</button> :
              null
          }
        </header>
        <div className="App-body">
          {
          route === 'login' ?
            <Login username={username} password={password}/> :
            route === 'main' ?
              <Main flavor={flavor} username={username}/> :
              <div>Unknown route {route}</div>
          }
          {
            error ? <div className="error">{error}</div> : null
          }
        </div>
      </div>
    );
  }
}

export default App;
