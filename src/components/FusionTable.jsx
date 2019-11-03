import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch, Icon, Tooltip, Popover, Select, Divider } from 'antd';

import './FusionTableDetail.css';

const { Option } = Select;

const helpText = {
  canonical: "By default, only the canonical isoform for each gene in the fusion are shown. Each gene has one canonical isoform, which usually represents the biologically most interesting isoform as well as having the longest coding sequence."
};

class FusionTableDetail extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { fusions, width, onTableRowClickCallback } = this.props;

    var fusionIsoforms = fusions ? this._filterFusions(fusions) : null;

    const columns = [
      {
        title: '5\' gene isoform',
        dataIndex: 'displayData',
        key: 'transcript1.id',
        render: val => {
          const contentGene = (
            <div>
              <p><b>ID: </b>{val[0].id}</p>
              <p><b>Biotype: </b>{val[0].biotype}</p>
              <p><b>Complete CDS: </b>{val[0].complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val[0].cdnaLength} bp</p>
              <p><b>CDS length: </b>{val[0].cdsLength ? val[0].cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val[0].proteinLength ? val[0].proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val[0].name}>
                <Tag key={val[0].name}>{val[0].name}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%'
      },
      {
        title: '3\' gene isoform',
        dataIndex: 'displayData',
        key: 'transcript2.id',
        render: val => {
          const contentGene = (
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
              <Popover content={contentGene} title={val[1].name}>
                <Tag key={val[1].name}>{val[1].name}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%'
      },
      {
        title: 'Protein effect',
        dataIndex: 'effect',
        key: 'effect',
        render: val => (val ? val : 'NA'),
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
      },
      {
        title: 'Has protein coding potential',
        dataIndex: 'hasProteinCodingPotential',
        key: 'hasProteinCodingPotential',
        render: val => (val ? 'Yes' : 'Unknown'),
        width: '15%'
      },
    ];

    return (
      fusions ?
        <Fragment>
          <Divider>Table of fusion isoforms</Divider>
          <Row>
            <Table
              rowKey="name"
              dataSource={fusionIsoforms}
              columns={columns}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => onTableRowClickCallback(record)
                };
              }} />
          </Row>
        </Fragment>
        : null
    )
  }

  _filterFusions(fusions) {

    var fusionIsoforms = [];

    Object.keys(fusions).map(fusion => {
      return Object.keys(fusions[fusion].transcripts).map(val => {
        if (fusions[fusion].transcripts[val].canonical) {
          fusionIsoforms.push(fusions[fusion].transcripts[val]);
        }
      });
    });

    return fusionIsoforms;
  }
}

export default FusionTableDetail;