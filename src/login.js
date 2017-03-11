import React, {Component, PropTypes as t} from 'react';
import 'whatwg-fetch';

function onChangePassword(event) {
  React.setState({password: event.target.value});
}

function onChangeUsername(event) {
  React.setState({username: event.target.value});
}

class Login extends Component {
  static propTypes = {
    password: t.string.isRequired,
    restUrl: t.string.isRequired,
    username: t.string.isRequired
  };

  // This is called when the "Log In" button is pressed.
  onLogin = async () => {
    const {password, restUrl, username} = this.props;
    const url = `${restUrl}/login`;

    try {
      // Send username and password to login REST service.
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });
      if (res.ok) { // successful login
        const token = res.headers.get('Authorization');
        const text = await res.text(); // returns a promise
        const authenticated = text === 'true';
        React.setState(
          authenticated ?
          {
            authenticated: true,
            error: null, // clear previous error
            route: 'main',
            token
          } :
          {
            error: 'Invalid username or password'
          });
      } else { // unsuccessful login
        const msg = /ECONNREFUSED/.test(res.statusText) ?
          'Failed to connect to database' :
          res.statusText;
        React.setState({error: msg});
      }
    } catch (e) {
      React.setState({error: `${url}; ${e.message}`});
    }
  }

  // This is called when the "Signup" button is pressed.
  onSignup = async () => {
    const {password, restUrl, username} = this.props;
    const url = `${restUrl}/signup`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });

      if (res.ok) { // successful signup
        const token = res.headers.get('Authorization');
        React.setState({
          authenticated: true,
          error: null, // clear previous error
          route: 'main',
          token,
          username
        });
      } else { // unsuccessful signup
        let text = res.statusText;
        if (/duplicate key/.test(text)) {
          text = `User ${username} already exists`;
        }
        React.setState({error: text});
      }
    } catch (e) {
      React.setState({error: `${url}; ${e.message}`});
    }
  }

  render() {
    const {password, username} = this.props;
    const canSubmit = username && password;

    // We are handling sending the username and password
    // to a REST service above, so we don't want
    // the HTML form to submit anything for us.
    // That is the reason for the call to preventDefault.
    return (
      <form className="login-form"
        onSubmit={event => event.preventDefault()}>
        <div className="row">
          <label>Username:</label>
          <input type="text"
            autoFocus
            onChange={onChangeUsername}
            value={username}
          />
        </div>
        <div className="row">
          <label>Password:</label>
          <input type="password"
            onChange={onChangePassword}
            value={password}
          />
        </div>
        <div className="row submit">
          {/* Pressing enter in either input invokes the first button. */}
          <button disabled={!canSubmit} onClick={this.onLogin}>
            Log In
          </button>
          <button disabled={!canSubmit}onClick={this.onSignup}>
            Signup
          </button>
        </div>
      </form>
    );
  }
}

export default Login;
