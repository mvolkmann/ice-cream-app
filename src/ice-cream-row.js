import React from 'react';

const IceCreamRow = ({deleteCb, iceCream}) =>
  <li className="ice-cream-row">
    {/* using unicode heavy x */}
    <button onClick={() => deleteCb(iceCream.id)}>&#x2716;</button>
    {iceCream.flavor}
  </li>;

const {func, number, shape, string} = React.PropTypes;
IceCreamRow.propTypes = {
  deleteCb: func.isRequired,
  iceCream: shape({
    flavor: string,
    id: number
  })
};

export default IceCreamRow;
