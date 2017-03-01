import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App/>, div);
});

it('renders an App-body', () => {
  const wrapper = shallow(<App />);
  const footer = <div className="footer" id="footer">Snapshot</div>;
  expect(wrapper.contains(footer)).toEqual(true);
});

