import React, {Component} from 'react';
import 'whatwg-fetch';

//const REST_URL = 'https://localhost';
const REST_URL = 'http://localhost:1919';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      password: 'foobar', //TODO: prefilled for testing
      username: 'mvolkmann' //TODO: prefilled for testing
    };

    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onRegister = this.onRegister.bind(this);
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
          window.setState({error: null, route: 'main'});
        } else {
          window.setState({error: 'invalid username or password'});
        }
      })
      .catch(res => {
        console.error('login.js onLogin: res =', res);
        window.setState({error: `${url}; ${res.message}`});
      });
  }

  onRegister(event) {
    event.preventDefault();

    const {password, username} = this.state;
    const url =
      `${REST_URL}/register?username=${username}&password=${password}`;
    fetch(url, {method: 'POST'})
      .then(() => {
        console.log('successfully registered new user');
      })
      .catch(res => {
        console.error('login.js onRegister: res =', res);
        window.setState({error: `${url}; ${res.message}`});
      });
  }

  render() {
    const {password, username} = this.state;
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
          <button onClick={this.onRegister}>Register</button>
          <button onClick={this.onLogin}>Log In</button>
        </div>
      </form>
    );
  }
}

//const {func} = React.PropTypes;
Login.propTypes = {
};

export default Login;
