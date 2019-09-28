import React from 'react';
import { Layout, Row, Col, Card, Select } from 'antd';

import './InputOption.css';

class InputOption extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="input">
        <label>{this.props.label}:</label>
        <Select defaultValue={this.props.default} style={{ width: 120 }} >
          {this.props.options}
        </Select>
      </div>
    )
  };
}

export default InputOption;