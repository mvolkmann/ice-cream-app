import React from 'react';

const IceCreamEntry = ({addCb, changeCb, flavor}) =>
  <form
    className="ice-cream-entry"
    onSubmit={event => event.preventDefault()}
  >
    <label>Flavor</label>
    <input type="text" autoFocus onChange={changeCb} value={flavor}/>
    {/* using unicode heavy plus */}
    <button onClick={() => addCb(flavor)}>&#x2795;</button>
  </form>;

const {func, string} = React.PropTypes;
IceCreamEntry.propTypes = {
  addCb: func.isRequired,
  changeCb: func.isRequired,
  flavor: string,
};

export default IceCreamEntry;
