import IceCreamEntry from './ice-cream-entry';
import IceCreamList from './ice-cream-list';
import React, {Component} from 'react';
import 'whatwg-fetch';
import './App.css';

const REST_URL = 'https://localhost/ice-cream';
const {object, string} = React.PropTypes;

function changeFlavor(event) {
  React.setState({flavor: event.target.value});
}

function handleError(url, res) {
  const {status} = res;
  console.log('main.js handleErr: status =', status);
  if (status === 440) {
    React.setState({error: 'Session Timeout', route: 'login'});
  } else {
    React.setState({error: res.message});
  }
}

/* eslint-disable no-invalid-this */
class Main extends Component {

  static propTypes = {
    flavor: string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    iceCreamMap: object.isRequired,
    token: string.isRequired,
    username: string.isRequired
  };

  componentDidMount() {
    const {token, username} = this.props;
    this.headers = {Authorization: token};

    const url = `${REST_URL}/${username}`;
    fetch(url, {headers: this.headers})
      .then(res => {
        if (!res.ok) handleError(url, res);
        return res.ok ? res.json() : null;
      })
      .then(iceCreams => {
        if (!iceCreams) return;

        const iceCreamMap = {};
        for (const iceCream of iceCreams) {
          iceCreamMap[iceCream.id] = iceCream.flavor;
        }
        React.setState({iceCreamMap});
      })
      .catch(handleError.bind(null, url));
  }

  addIceCream = flavor => {
    const {username} = this.props;
    const url = `${REST_URL}/${username}?flavor=${flavor}`;
    fetch(url, {method: 'POST', headers: this.headers})
      .then(res => {
        if (!res.ok) handleError(url, res);
        return res.ok ? res.text() : null;
      })
      .then(id => {
        if (!id) return;

        id = Number(id);
        const {iceCreamMap} = this.props;
        iceCreamMap[id] = flavor;
        React.setState({flavor: '', iceCreamMap});
      })
      .catch(handleError.bind(null, url));
  };

  deleteIceCream = id => {
    const {username} = this.props;
    const url = `${REST_URL}/${username}/${id}`;
    fetch(url, {method: 'DELETE', headers: this.headers})
      .then(res => {
        if (res.ok) {
          const {iceCreamMap} = this.props;
          delete iceCreamMap[id];
          React.setState({iceCreamMap});
        } else {
          handleError(url, res);
        }
      })
      .catch(handleError.bind(null, url));
  };

  render() {
    const {flavor, iceCreamMap, username} = this.props;
    return (
      <div className="main">
        <IceCreamEntry
          addCb={this.addIceCream}
          changeCb={changeFlavor}
          flavor={flavor}
        />
        <label>{username}&apos;s favorite flavors are:</label>
        <IceCreamList
          deleteCb={this.deleteIceCream}
          iceCreamMap={iceCreamMap}
        />
      </div>
    );
  }
}

export default Main;
