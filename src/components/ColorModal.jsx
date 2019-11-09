import React from 'react';
import { Modal, Button } from 'antd';
import { SketchPicker } from 'react-color';

import './ColorModal.css'

export class ColorModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      color: "#fff"
    };

    this._handleChangeComplete = this._handleChangeComplete.bind(this);
    this._onOk = this._onOk.bind(this);
    this._onCancel = this._onCancel.bind(this);
  }

  render() {

    const { color } = this.state;

    return (
      <Modal
        title="Pick a color"
        visible={true}
        className="Color-modal"
        footer={[
          <Button key="cancel" onClick={this._onCancel}>
            Cancel
          </Button>,
          <Button key="submit" onClick={this._onOk}>
            Ok
          </Button>,
          ]}
        >
        <SketchPicker
          onChangeComplete={ this._handleChangeComplete }
          color={ color }
          />
      </Modal>
    )
  }

  _onOk() {
    const { color } = this.state;
    const { domainToColor, closeModalCallback } = this.props;

    closeModalCallback(domainToColor, color);
  }

  _onCancel() {
    const { closeModalCallback } = this.props;

    closeModalCallback();
  }

  _handleChangeComplete(color) {
    this.setState({ color: color.hex });
  };
}