import React from 'react';
import IceCreamRow from './ice-cream-row';

const IceCreamList = ({deleteCb, iceCreamMap}) => {
  const list =
    Object.keys(iceCreamMap).map(
      id => ({id, flavor: iceCreamMap[id]}));
  list.sort(
    (a, b) => a.flavor.localeCompare(b.flavor));

  return (
    <ul className="ice-cream-list">
      {
        list.map(iceCream =>
          <IceCreamRow
            deleteCb={deleteCb}
            id={iceCream.id}
            key={iceCream.id}
            flavor={iceCream.flavor}
          />)
      }
    </ul>
  );
};

const {func, object} = React.PropTypes;
IceCreamList.propTypes = {
  deleteCb: func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  iceCreamMap: object.isRequired
};

export default IceCreamList;
