import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch, Icon, Tooltip, Popover, Select, Divider } from 'antd';

import './FusionTable.css';

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
        title: '5\' gene',
        dataIndex: 'displayData',
        key: 'transcript1.geneName',
        render: val => {

          if (!val[0].id) {
            return (
              <p>
                <Tooltip title={val[2].join(' ')}>
                  <Icon type="warning" theme="twoTone" twoToneColor="red" />
                  {val[0]}
                </Tooltip>
              </p>
            )
            return val[0];
          }

          const contentGene = (
            <div>
              <p><b>Transcript ID: </b>{val[0].id}</p>
              <p><b>Biotype: </b>{val[0].biotype}</p>
              <p><b>Complete CDS: </b>{val[0].complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val[0].cdnaLength} bp</p>
              <p><b>CDS length: </b>{val[0].cdsLength ? val[0].cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val[0].proteinLength ? val[0].proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val[0].geneName}>
                <Tag key={val[0].name}>{val[0].geneName}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%',
        filters: [...new Set(fusionIsoforms.map(val => val.transcript1.geneName))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.transcript1.geneName.indexOf(value) === 0,
      },
      {
        title: '3\' gene',
        dataIndex: 'displayData',
        key: 'transcript2.geneName',
        render: val => {

          if (!val[1].id) {
            return val[1];
          }

          const contentGene = (
            <div>
              <p><b>Transcript ID: </b>{val[1].id}</p>
              <p><b>Biotype: </b>{val[1].biotype}</p>
              <p><b>Complete CDS: </b>{val[1].complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val[1].cdnaLength} bp</p>
              <p><b>CDS length: </b>{val[1].cdsLength ? val[1].cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val[1].proteinLength ? val[1].proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val[1].geneName}>
                <Tag key={val[1].name}>{val[1].geneName}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%',
        filters: [...new Set(fusionIsoforms.map(val => val.transcript2.geneName))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.transcript2.geneName.indexOf(value) === 0,
      },
      {
        title: 'Protein effect',
        dataIndex: 'effect',
        key: 'effect',
        width: '15%',
        filters: [...new Set(fusionIsoforms.map(val => val.effect))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.effect.indexOf(value) === 0,
      },
      {
        title: '5\' junction',
        dataIndex: 'gene1Junction',
        key: 'gene1Junction',
        width: '15%'
      },
      {
        title: '3\' junction',
        dataIndex: 'gene2Junction',
        key: 'gene2Junction',
        width: '15%'
      },
      {
        title: 'Has protein coding potential',
        dataIndex: 'hasProteinCodingPotential',
        key: 'hasProteinCodingPotential',
        render: val => (val ? 'Yes' : 'Unknown'),
        width: '15%',
        filters: [...new Set(fusionIsoforms.map(val => {
          return val ? 'Yes' : 'Unknown';
        }))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.effect.indexOf(value) === 0,
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

      if (fusions[fusion].errorMsg) {
        fusionIsoforms.push({
          displayData: [
            fusions[fusion].gene1,
            fusions[fusion].gene2,
            fusions[fusion].errorMsg
          ],
          transcript1: {id: fusions[fusion].gene1},
          transcript2: {id: fusions[fusion].gene2},
          gene1Junction: fusions[fusion].gene1Junction,
          gene2Junction: fusions[fusion].gene2Junction,
          effect: 'NA',
          hasProteinCodingPotential: null,
        });
      } else {
        Object.keys(fusions[fusion].transcripts).map(val => {
          if (fusions[fusion].transcripts[val].canonical) {
            fusionIsoforms.push(fusions[fusion].transcripts[val]);
          }
        });
      }
    });

    return fusionIsoforms;
  }
}

export default FusionTableDetail;