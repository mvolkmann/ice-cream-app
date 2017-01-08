import React from 'react';

const IceCreamRow = ({deleteCb, flavor, id}) =>
  <li className="ice-cream-row">
    {/* using unicode heavy x */}
    <button onClick={() => deleteCb(id)}>&#x2716;</button>
    {flavor}
  </li>;

const {func, string} = React.PropTypes;
IceCreamRow.propTypes = {
  deleteCb: func.isRequired,
  flavor: string,
  id: string
};

export default IceCreamRow;
