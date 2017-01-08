import IceCreamEntry from './ice-cream-entry';
import IceCreamList from './ice-cream-list';
import React, {Component} from 'react';
import 'whatwg-fetch';
import './App.css';

const REST_URL = 'https://localhost/ice-cream';

function handleError(url, res) {
  window.setState({error: `${url}; ${res.message}`});
}

/* eslint-disable no-invalid-this */
class Main extends Component {
  state = {
    iceCreamMap: {},
    iceCreamList: []
  };

  componentDidMount() {
    const {username} = this.props;
    const url = `${REST_URL}/${username}`;
    fetch(url)
      .then(res => res.json())
      .then(iceCreams => {
        const iceCreamMap = {};
        for (const iceCream of iceCreams) {
          iceCreamMap[iceCream.id] = iceCream;
        }
        this.updateList(iceCreamMap);
      })
      .catch(handleError.bind(null, url));
  }

  addIceCream = flavor => {
    const {username} = this.props;
    const url = `${REST_URL}/${username}?flavor=${flavor}`;
    fetch(url, {method: 'POST'})
      .then(res => res.text())
      .then(id => {
        id = Number(id);
        const {iceCreamMap} = this.state;
        iceCreamMap[id] = {id, flavor};
        this.updateList(iceCreamMap);
        window.setState({flavor: ''});
      })
      .catch(handleError.bind(null, url));
  };

  changeFlavor = event =>
    window.setState({flavor: event.target.value});

  deleteIceCream = id => {
    const {username} = this.props;
    const url = `${REST_URL}/${username}/${id}`;
    fetch(url, {method: 'DELETE'})
      .then(() => {
        const {iceCreamMap} = this.state;
        delete iceCreamMap[id];
        this.updateList(iceCreamMap);
      })
      .catch(handleError.bind(null, url));
  };

  updateList(iceCreamMap) {
    const iceCreamList = Object.keys(iceCreamMap).map(key => iceCreamMap[key]);
    iceCreamList.sort((a, b) => a.flavor.localeCompare(b.flavor));
    this.setState({iceCreamList, iceCreamMap});
  }

  render() {
    const {iceCreamList} = this.state;
    const {flavor, username} = this.props;
    return (
      <div className="main">
        <IceCreamEntry
          addCb={this.addIceCream}
          changeCb={this.changeFlavor}
          flavor={flavor}
        />
        <label>Favorite flavors of {username} are:</label>
        <IceCreamList
          deleteCb={this.deleteIceCream}
          list={iceCreamList}
        />
      </div>
    );
  }
}

const {string} = React.PropTypes;
Main.propTypes = {
  flavor: string.isRequired,
  username: string.isRequired
};

export default Main;
