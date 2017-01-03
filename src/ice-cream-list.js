import React from 'react';
import IceCreamRow from './ice-cream-row';

const IceCreamList = ({deleteCb, list}) =>
  <ul className="ice-cream-list">
    {
      list.map(iceCream =>
        <IceCreamRow
          deleteCb={deleteCb}
          key={iceCream.id}
          iceCream={iceCream}
        />)
    }
  </ul>;

const {arrayOf, func, number, shape, string} = React.PropTypes;
IceCreamList.propTypes = {
  deleteCb: func.isRequired,
  list: arrayOf(shape({
    flavor: string,
    id: number
  }))
};

export default IceCreamList;
