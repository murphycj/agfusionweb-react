import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Icon, Tooltip, Popover, Divider, Button } from 'antd';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import './FusionTable.css';
import { Download } from '../library/utils/download';

class FusionTableDetail extends React.Component {

  constructor(props) {
    super(props);

    this._downloadFiles = this._downloadFiles.bind(this);
  }

  render() {
    const { fusions, onTableRowClickCallback } = this.props;

    var fusionIsoforms = fusions ? this._filterFusions(fusions) : null;

    const columns = [
      {
        title: '5\' gene',
        dataIndex: 'displayData',
        key: 'transcript1.geneName',
        render: val => {

          if (!val.gene1.id) {
            return (
              <p>
                <Tooltip title={val.errorMsg.join(' ')}>
                  <Icon type="warning" theme="twoTone" twoToneColor="red" />
                  {val.gene1}
                </Tooltip>
              </p>
            )
            return val.gene1;
          }

          const contentGene = (
            <div>
              <p><b>Transcript ID: </b>{val.gene1.id}</p>
              <p><b>Biotype: </b>{val.gene1.biotype}</p>
              <p><b>Complete CDS: </b>{val.gene1.complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val.gene1.cdnaLength} bp</p>
              <p><b>CDS length: </b>{val.gene1.cdsLength ? val.gene1.cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val.gene1.proteinLength ? val.gene1.proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene1.geneName}>
                <Tag key={val.gene1.name}>{val.gene1.geneName}</Tag>
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

          if (!val.gene2.id) {
            return val.gene2;
          }

          const contentGene = (
            <div>
              <p><b>Transcript ID: </b>{val.gene2.id}</p>
              <p><b>Biotype: </b>{val.gene2.biotype}</p>
              <p><b>Complete CDS: </b>{val.gene2.complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val.gene2.cdnaLength} bp</p>
              <p><b>CDS length: </b>{val.gene2.cdsLength ? val.gene2.cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val.gene2.proteinLength ? val.gene2.proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene2.geneName}>
                <Tag key={val.gene2.name}>{val.gene2.geneName}</Tag>
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
        onFilter: (value, record) => record.effect === value,
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
          return val.hasProteinCodingPotential ? 'Yes' : 'Unknown';
        }))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => {
          return (record.hasProteinCodingPotential ? 'Yes' : 'Unknown') === value;
        },
      },
    ];

    return (
      fusions ?
        <Fragment>
          <Divider>Table of fusion isoforms</Divider>
          <Row>
            <Col span={18} />
            <Col span={6} className="Download-button">
              <Button loading={false} onClick={this._downloadFiles}>
                <Icon type="download" />
                Fusion data
              </Button>
            </Col>
          </Row>
          <Row>
            <Table
              rowKey="name"
              dataSource={fusionIsoforms}
              columns={columns}
              pagination={{ pageSize: 25 }} 
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

  _downloadFiles() {

    const { fusions } = this.props;

    var zip = new JSZip();

    var download = new Download(zip, fusions);

    download.zip.generateAsync({type:"blob"})
    .then(function (blob) {
      saveAs(blob, "fusions.zip");
    });
  }

  _filterFusions(fusions) {

    var fusionIsoforms = [];

    Object.keys(fusions).map(fusion => {

      if (fusions[fusion].errorMsg) {
        fusionIsoforms.push({
          name: `${fusions[fusion].gene1}_${fusions[fusion].gene2}`,
          displayData: {
            gene1: fusions[fusion].gene1,
            gene2: fusions[fusion].gene2,
            errorMsg: fusions[fusion].errorMsg,
          },
          transcript1: {
            id: fusions[fusion].gene1,
            geneName: fusions[fusion].gene1
          },
          transcript2: {
            id: fusions[fusion].gene2,
            geneName: fusions[fusion].gene2
          },
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