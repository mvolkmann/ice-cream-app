import React, {Component} from 'react';
import 'whatwg-fetch';

const REST_URL = 'https://localhost';
//const REST_URL = 'http://localhost:1919';

class Login extends Component {
  constructor() {
    super();
    this.state = {};

    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onSignup = this.onSignup.bind(this);
  }

  onChange(name, value) {
    this.setState({[name]: value});
  }

  onChangePassword(event) {
    this.onChange('password', event.target.value);
  }

  onChangeUsername(event) {
    this.onChange('username', event.target.value);
  }

  onLogin(event) {
    event.preventDefault();

    const {password, username} = this.state;
    const url = `${REST_URL}/login`;
    fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    })
      .then(res => res.text())
      .then(text => {
        const authenticated = text === 'true';
        if (authenticated) {
          window.setState({error: null, route: 'main', username});
        } else {
          window.setState({error: 'invalid username or password'});
        }
      })
      .catch(res => {
        window.setState({error: `${url}; ${res.message}`});
      });
  }

  onSignup(event) {
    event.preventDefault();

    const {password, username} = this.state;
    const url = `${REST_URL}/signup`;
    let error = false;

    fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    })
      .then(res => {
        if (!res.ok) error = true;
        return res.text();
      })
      .then(text => {
        if (error) {
          if (/duplicate key/.test(text)) {
            text = `User ${username} already exists.`;
          }
          window.setState({error: text});
        } else { // successful signup
          window.setState({error: null, route: 'main', username});
        }
      })
      .catch(res => {
        window.setState({error: `${url}; ${res.message}`});
      });
  }

  render() {
    const {password, username} = this.state;
    const canSubmit = username && password;

    return (
      <form className="login-form">
        <div className="row">
          <label>Username:</label>
          <input type="text" name="username"
            onChange={this.onChangeUsername}
            value={username}
          />
        </div>
        <div className="row">
          <label>Password:</label>
          <input type="password" name="password"
            onChange={this.onChangePassword}
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

//const {func} = React.PropTypes;
Login.propTypes = {
};

export default Login;
