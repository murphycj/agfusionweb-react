import React from 'react';
import { Select } from 'antd';

import './InputOption.css';

class InputOption extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const { callback, selectedValue, label, options } = this.props;

    return (
      <div className="input">
        <label>{label}:</label>
        <Select value={selectedValue} style={{ width: 200 }} onChange={callback}>
          {options}
        </Select>
      </div>
    )
  };
}

export default InputOption;