import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch, Icon, Tooltip, Popover } from 'antd';

import Plot from './Plot.jsx';
import './FusionTable.css';

class FusionTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onlyCanonical: true,
      selectedFusion: null
    }

    this.onChangeCanonical = this.onChangeCanonical.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  onChangeCanonical() {
    var onlyCanonical = !this.state.onlyCanonical;
    this.setState({
      onlyCanonical: onlyCanonical,
    });
  }

  onSelectRow(fusion) {
    console.log(fusion)
    this.setState({
      selectedFusion: fusion,
    })
  }

  render() {

    if (this.props.fusions) {
      var fusions = Object.keys(this.props.fusions[0].transcripts).map(val => this.props.fusions[0].transcripts[val]);
      if (this.state.onlyCanonical) {
        fusions = fusions.filter(val => val.canonical);
      }
    }

    const columns = [
      {
        title: 'Gene isoforms',
        dataIndex: 'displayData',
        key: 'name',
        render: val => {
          const contentGene1 = (
            <div>
              <p><b>ID: </b>{val[0].id}</p>
              <p><b>Biotype: </b>{val[0].biotype}</p>
              <p><b>Complete CDS: </b>{val[0].complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val[0].cdnaLength} bp</p>
              <p><b>CDS length: </b>{val[0].cdsLength ? val[0].cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val[0].proteinLength ? val[0].proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          const contentGene2 = (
            <div>
              <p><b>ID: </b>{val[1].id}</p>
              <p><b>Biotype: </b>{val[1].biotype}</p>
              <p><b>Complete CDS: </b>{val[1].complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val[1].cdnaLength} bp</p>
              <p><b>CDS length: </b>{val[1].cdsLength ? val[1].cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val[1].proteinLength ? val[1].proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene1} title={val[0].name}>
                <Tag key={val[0].name}>{val[0].name}</Tag>
              </Popover>
              <Popover content={contentGene2} title={val[1].name}>
                <Tag key={val[1].name}>{val[1].name}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '25%'
      },
      {
        title: 'Has protein coding potential',
        dataIndex: 'hasProteinCodingPotential',
        key: 'hasProteinCodingPotential',
        render: val => (val ? 'Yes' : 'No'),
        width: '15%'
      },
      {
        title: 'Effect',
        dataIndex: 'effect',
        key: 'effect',
        width: '15%'
      },
      {
        title: '5\' junction location',
        dataIndex: 'gene1JunctionLoc',
        key: 'gene1JunctionLoc',
        width: '15%'
      },
      {
        title: '3\' junction location',
        dataIndex: 'gene2JunctionLoc',
        key: 'gene2JunctionLoc',
        width: '15%'
      }
    ];

    return (
      this.props.fusions ?
        <Fragment>
          <Row>
            <Plot selectedFusion={this.state.selectedFusion} />
          </Row>
          <hr/>
          <Row className="Controls">
            <Col span={6}>
              Genes:
              <Tag>{this.props.fusions[0].gene1.name}</Tag>
              <Tag>{this.props.fusions[0].gene2.name}</Tag>
            </Col>
            <Col span={6}>
              Show only canonical
              <Tooltip className="Tooltip" title="By default, only the canonical isoform for each gene in the fusion are shown. Each gene has one canonical isoform, which usually represents the biologically most interesting isoform as well as having the longest coding sequence.">
                <Icon type="question-circle" />
              </Tooltip>: <Switch checked={this.state.onlyCanonical} onChange={this.onChangeCanonical}/>
            </Col>
            <Col span={6}>
            </Col>
            <Col span={6}>
            </Col>
          </Row>
          <Row>
            <Table
              rowKey="name"
              dataSource={fusions}
              columns={columns}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => this.onSelectRow(record)
                };
              }} />
          </Row>
        </Fragment>
        : null
    )
  }
}

export default FusionTable;