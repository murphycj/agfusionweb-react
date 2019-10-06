import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch } from 'antd';

class FusionTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onlyCanonical: true,
    }

    this.onChangeCanonical = this.onChangeCanonical.bind(this);
  }

  onChangeCanonical() {
    var onlyCanonical = !this.state.onlyCanonical;
    this.setState({
      onlyCanonical: onlyCanonical,
    });
  }

  render() {

    const columns = [
      {
        title: 'Gene isoforms',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Is protein coding',
        dataIndex: 'hasProteinCodingPotential',
        key: 'hasProteinCodingPotential',
        render: val => (val ? 'Yes' : 'No')
      },
      {
        title: 'Effect',
        dataIndex: 'effect',
        key: 'effect'
      }
    ];
    if (this.props.fusions) {
      var fusions = Object.keys(this.props.fusions[0].transcripts).map(val => this.props.fusions[0].transcripts[val]);
      if (this.state.onlyCanonical) {
        fusions = fusions.filter(val => val.canonical);
      }
    }

    return (
      this.props.fusions ?
        <Fragment>
          <Row>
            <Col span={6}>
              Genes:
              <Tag>{this.props.fusions[0].gene1.name}</Tag>
              <Tag>{this.props.fusions[0].gene2.name}</Tag>
            </Col>
            <Col span={6}>
              Show only canonical: <Switch checked={this.state.onlyCanonical} onChange={this.onChangeCanonical}/>
            </Col>
            <Col span={12}>
            </Col>
          </Row>
          <Row>
            <Table
              rowKey="name"
              dataSource={fusions}
              columns={columns} />
          </Row>
        </Fragment>
        : null
    )
  }
}

export default FusionTable;