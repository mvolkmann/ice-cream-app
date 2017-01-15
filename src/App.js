import React, {Component} from 'react';
import Login from './login';
import Main from './main';
import 'whatwg-fetch';
import './App.css';

/* eslint-disable no-invalid-this */
/* global io */
class App extends Component {

  constructor() {
    super();
    React.setState = this.setState.bind(this);

    const socket = io('https://localhost', {secure: true});
    socket.on('session-timeout', () => {
      alert('Your session timed out.');
      this.logout();
    });
  }

  state = {
    authenticated: false,
    error: '',
    flavor: '',
    iceCreamMap: {},
    password: 'foobar',
    restUrl: 'https://localhost',
    route: 'login',
    token: '',
    username: 'mvolkmann'
  };

  logout = () => {
    const url = `${this.state.restUrl}/logout`;
    const {token} = this.state;
    const headers = {Authorization: token};
    fetch(url, {method: 'POST', headers})
      .then(() => React.setState({route: 'login'}))
      .catch();
  };

  render() {
    const {
      error, flavor, iceCreamMap, password, restUrl, route, token, username
    } = this.state;

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
            <Login
              username={username}
              password={password}
              restUrl={restUrl}
            /> :
            route === 'main' ?
              <Main
                flavor={flavor}
                iceCreamMap={iceCreamMap}
                restUrl={restUrl}
                token={token}
                username={username}
              /> :
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
