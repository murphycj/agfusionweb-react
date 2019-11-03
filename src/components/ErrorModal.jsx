import React from 'react';
import { Modal, Button, List, Typography } from 'antd';

const { Text } = Typography;

export class ErrorModal extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const { errorMsg, closeModalCallback } = this.props;

    return (
      <Modal
        title="Input errors"
        visible={true}
        onOk={closeModalCallback}
        footer={[
          <Button key="submit" type="danger" onClick={closeModalCallback}>
            Ok
          </Button>,
          ]}
        >
      <List
        dataSource={errorMsg}
        bordered
        itemLayout="horizontal"
        split={false}
        pagination={{pageSize: 5}}
        renderItem={item => (
          <List.Item>
            {
              item.split(' ').length == 1 ?
                item :
                <p><b>{item.split(': ')[0] + ': '}</b> {item.split(': ')[1]}</p>
            }
          </List.Item>
        )}
        />
      </Modal>
    )

  }
}

// <p><Text type="danger">{item[0]}</Text>{item[1]}</p>