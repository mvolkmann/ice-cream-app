import React, {Component} from 'react';
import 'whatwg-fetch';

const REST_URL = 'http://localhost:1919/ice-cream';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      username: ''
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

  onLogin() {
    const {password, username} = this.state;
    const url =
      `${REST_URL}/login?username=${username}&password=${password}`;
    fetch(url, {method: 'POST'})
      .then(() => {
        console.log('successfully logged in');
      })
      .catch(res => this.setState({error: `${url}; ${res.message}`}));
  }

  onRegister() {
    const {password, username} = this.state;
    const url =
      `${REST_URL}/register?username=${username}&password=${password}`;
    fetch(url, {method: 'POST'})
      .then(() => {
        console.log('successfully registered new user');
      })
      .catch(res => this.setState({error: `${url}; ${res.message}`}));
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
