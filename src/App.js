import React, {Component} from 'react';
import Login from './login';
import Main from './main';
import 'whatwg-fetch';
import './App.css';

// This was added to allow the client to listen to
// socket.io events emitted from the server.  It is used to
// proactively terminate sessions when the session timeout expires.
import io from 'socket.io-client';

class App extends Component {
  constructor() {
    super();

    // Redux is a popular library for managing state in a React application.
    // This application, being somewhat small, opts for a simpler approach
    // where the top-most component manages all of the state.
    // Placing a bound version of the setState method on the React object
    // allows other components to call it in order to modify state.
    // Each call causes the UI to re-render.
    React.setState = this.setState.bind(this);

    // This gets a socket.io connection from the server
    // and registers for "session-timeout" events.
    // If one is received, the users is logged out.
    /* global io */
    const socket = io('https://localhost', {secure: true});
    socket.on('session-timeout', () => {
      alert('Your session timed out.');
      this.logout();
    });
  }

  // This is the initial state of the application.
  state = {
    authenticated: false,
    error: '',
    flavor: '',
    iceCreamMap: {},
    password: '',
    restUrl: 'https://localhost',
    route: 'login', // controls the current page
    token: '',
    username: ''
  };

  /**
   * Sends a logout POST request to the server
   * and goes to the login page.
   */
  logout = () => {
    /* eslint-disable no-invalid-this */
    const url = `${this.state.restUrl}/logout`;
    const headers = {Authorization: this.state.token};
    fetch(url, {method: 'POST', headers})
      .then(() => React.setState({
        authenticated: false,
        route: 'login',
        password: '',
        username: ''
      }))
      .catch();
  };

  render() {
    // Use destructuring to extract data from the state object.
    const {
      authenticated, error, flavor, iceCreamMap,
      password, restUrl, route, token, username
    } = this.state;

    return (
      <div className="App">
        <header>
          <img className="header-img" src="ice-cream.png" alt="ice cream" />
          Ice cream, we all scream for it!
          {
            authenticated ?
              <button onClick={this.logout}>Log out</button> :
              null
          }
        </header>
        <div className="App-body">
          {
            // This is an alternative to controlling routing to pages
            // that is far simpler than more full-blown solutions
            // like react-router.
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
            // If an error has occurred, render it at the bottom of any page.
            error ? <div className="error">{error}</div> : null
          }
        </div>
      </div>
    );
  }
}

export default App;
