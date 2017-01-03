import React, {Component} from 'react';
import IceCreamEntry from './ice-cream-entry';
import IceCreamList from './ice-cream-list';
import 'whatwg-fetch';
import './App.css';

const REST_URL = 'http://localhost:1919/ice-cream';

class App extends Component {
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
    fetch(REST_URL)
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
    const url = `${REST_URL}?flavor=${flavor}`;
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
    const url = `${REST_URL}/${id}`;
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
    const {error, flavor, iceCreamList} = this.state;

    const errorDiv = error ?
      <div className="error">{error}</div> :
      null;
    return (
      <div className="App">
        <header>
          <img src="ice-cream.png" alt="ice cream"/>
          Ice cream, we all scream for it!
        </header>
        <div className="App-body">
          {errorDiv}
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
      </div>
    );
  }
}

export default App;
