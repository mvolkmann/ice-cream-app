import React, {Component} from 'react';
import 'whatwg-fetch';

const {string} = React.PropTypes;

function onChangePassword(event) {
  React.setState({password: event.target.value});
}

function onChangeUsername(event) {
  React.setState({username: event.target.value});
}

/* eslint-disable no-invalid-this */
class Login extends Component {

  static propTypes = {
    password: string.isRequired,
    restUrl: string.isRequired,
    username: string.isRequired
  };

  onLogin = () => {
    const {password, restUrl, username} = this.props;
    let token;
    const url = `${restUrl}/login`;

    fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    })
      .then(res => {
        token = res.headers.get('Authorization');
        return res.text();
      })
      .then(text => {
        const authenticated = text === 'true';
        React.setState(authenticated ?
          {error: null, route: 'main', token, username} :
          {error: 'Invalid username or password.'});
      })
      .catch(res => {
        React.setState({error: `${url}; ${res.message}`});
      });
  }

  onSignup = () => {
    const {password, restUrl, username} = this.props;
    let token;
    const url = `${restUrl}/signup`;
    let error = false;

    fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    })
      .then(res => {
        token = res.headers.get('Authorization');
        if (!res.ok) error = true;
        return res.text();
      })
      .then(text => {
        if (error) {
          if (/duplicate key/.test(text)) {
            text = `User ${username} already exists.`;
          }
          React.setState({error: text});
        } else { // successful signup
          React.setState({error: null, route: 'main', token, username});
        }
      })
      .catch(res => {
        React.setState({error: `${url}; ${res.message}`});
      });
  }

  render() {
    const {password, username} = this.props;
    const canSubmit = username && password;

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
