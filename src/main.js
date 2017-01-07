import React, {Component} from 'react';
import IceCreamEntry from './ice-cream-entry';
import IceCreamList from './ice-cream-list';
import 'whatwg-fetch';
import './App.css';

const REST_URL = 'https://localhost/ice-cream';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      error: '',
      flavor: '',
      iceCreamMap: {},
      iceCreamList: []
    };

    this.addIceCream = this.addIceCream.bind(this);
    this.changeFlavor = this.changeFlavor.bind(this);
    this.deleteIceCream = this.deleteIceCream.bind(this);
  }

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
      .catch(res => this.setState({error: `${URL}; ${res.message}`}));
  }

  addIceCream(flavor) {
    const {username} = this.props;
    const url = `${REST_URL}/${username}?flavor=${flavor}`;
    fetch(url, {method: 'POST'})
      .then(res => res.text())
      .then(id => {
        id = Number(id);
        const {iceCreamMap} = this.state;
        iceCreamMap[id] = {id, flavor};
        this.updateList(iceCreamMap);
        this.setState({flavor: ''});
      })
      .catch(res => this.setState({error: `${url}; ${res.message}`}));
  }

  changeFlavor(event) {
    const flavor = event.target.value;
    this.setState({flavor});
  }

  deleteIceCream(id) {
    const {username} = this.props;
    const url = `${REST_URL}/${username}/${id}`;
    fetch(url, {method: 'DELETE'})
      .then(() => {
        const {iceCreamMap} = this.state;
        delete iceCreamMap[id];
        this.updateList(iceCreamMap);
      })
      .catch(res => this.setState({error: `${url}; ${res.message}`}));
  }

  updateList(iceCreamMap) {
    const iceCreamList = Object.keys(iceCreamMap).map(key => iceCreamMap[key]);
    iceCreamList.sort((a, b) => a.flavor.localeCompare(b.flavor));
    this.setState({iceCreamList, iceCreamMap});
  }

  render() {
    const {flavor, iceCreamList} = this.state;
    return (
      <div>
        <IceCreamEntry
          addCb={this.addIceCream}
          changeCb={this.changeFlavor}
          flavor={flavor}
        />
        <label>Your favorite flavors are:</label>
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
  username: string.isRequired
};

export default Main;
