import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch, Icon, Tooltip, Popover, Select, Divider, Button } from 'antd';

import Plot from './Plot.jsx';
import './FusionTableDetail.css';

import { PlotWTExons } from '../library/plot/PlotWTExons';
import { PlotFusionExons } from '../library/plot/PlotFusionExons';
import { PlotWTProtein } from '../library/plot/PlotWTProtein';
import { PlotFusionProtein } from '../library/plot/PlotFusionProtein';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const { Option } = Select;

const helpText = {
  canonical: "By default, only the canonical isoform for each gene in the fusion are shown. Each gene has one canonical isoform, which usually represents the biologically most interesting isoform as well as having the longest coding sequence."
};

class FusionTableDetail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onlyCanonical: true,
      selectedFusionTranscript: null,
      plotDataAll: null,
      plotRef: React.createRef(),
    };

    this._onChangeCanonical = this._onChangeCanonical.bind(this);
    this._onSelectRow = this._onSelectRow.bind(this);
    this._downloadFiles = this._downloadFiles.bind(this);
  }

  componentDidMount() {
    const { defaultFusionTranscript } = this.props;
    this._createPlotDate(defaultFusionTranscript);
  }

  render() {
    const { plotDataAll, onlyCanonical, plotRef } = this.state;
    var { selectedFusionTranscript } = this.state;
    const { fusion, defaultFusionTranscript, width } = this.props;

    selectedFusionTranscript = selectedFusionTranscript || defaultFusionTranscript;

    var fusionIsoforms = fusion ? this._filterFusions(fusion, onlyCanonical) : null;

    const columns = [
      {
        title: '5\' gene isoform',
        dataIndex: 'displayData',
        key: 'transcript1.id',
        render: val => {
          const contentGene = (
            <div>
              <p><b>ID: </b>{val.gene1.id}</p>
              <p><b>Biotype: </b>{val.gene1.biotype}</p>
              <p><b>Complete CDS: </b>{val.gene1.complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val.gene1.cdnaLength} bp</p>
              <p><b>CDS length: </b>{val.gene1.cdsLength ? val.gene1.cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val.gene1.proteinLength ? val.gene1.proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene1.name}>
                <Tag key={val.gene1.name}>{val.gene1.name}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%',
        filters: [...new Set(fusionIsoforms.map(val => {
          return `${val.transcript1.name} / ${val.transcript1.id}`;
        }))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => {
          var val = `${record.transcript1.name} / ${record.transcript1.id}`;
          return val.indexOf(value) === 0;
        },
      },
      {
        title: '3\' gene isoform',
        dataIndex: 'displayData',
        key: 'transcript2.id',
        render: val => {
          const contentGene = (
            <div>
              <p><b>ID: </b>{val.gene2.id}</p>
              <p><b>Biotype: </b>{val.gene2.biotype}</p>
              <p><b>Complete CDS: </b>{val.gene2.complete ? 'Yes' : 'No'}</p>
              <p><b>cDNA length: </b>{val.gene2.cdnaLength} bp</p>
              <p><b>CDS length: </b>{val.gene2.cdsLength ? val.gene2.cdsLength + ' bp' : 'NA'}</p>
              <p><b>Protein length: </b>{val.gene2.proteinLength ? val.gene2.proteinLength + ' aa' : 'NA'}</p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene2.name}>
                <Tag key={val.gene2.name}>{val.gene2.name}</Tag>
              </Popover>
            </Fragment>
          )
        },
        width: '20%',
        filters: [...new Set(fusionIsoforms.map(val => {
          return `${val.transcript2.name} / ${val.transcript2.id}`;
        }))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => {
          var val = `${record.transcript2.name} / ${record.transcript2.id}`;
          return val.indexOf(value) === 0;
        },
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
        title: '5\' junction location',
        dataIndex: 'gene1JunctionLoc',
        key: 'gene1JunctionLoc',
        width: '15%',
        filters: [...new Set(fusionIsoforms.map(val => val.gene1JunctionLoc))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.effect.indexOf(value) === 0,
      },
      {
        title: '3\' junction location',
        dataIndex: 'gene2JunctionLoc',
        key: 'gene2JunctionLoc',
        width: '15%',
        filters: [...new Set(fusionIsoforms.map(val => val.gene2JunctionLoc))].map(val => {
          return {text: val, value: val};
        }),
        onFilter: (value, record) => record.effect.indexOf(value) === 0,
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
      fusion ?
        <Fragment>
          <Divider>Protein and exon plot</Divider>
          <Row>
            <div ref={plotRef}>
              <Plot selectedFusion={selectedFusionTranscript} plotDataAll={plotDataAll} width={width}/>
            </div>
          </Row>
          <Divider>Table of fusion isoforms</Divider>
          <Row className="Controls">
            <Col span={6}>
              <span className="HelpText"><b>{"Fusion: "}</b>{fusion.displayName}</span>
            </Col>
            <Col span={6}>
              Show only canonical
              <Tooltip className="Tooltip" title={helpText.canonical}>
                <Icon type="question-circle" />
              </Tooltip>: <Switch checked={onlyCanonical} onChange={this._onChangeCanonical}/>
            </Col>
            <Col span={6} />
            <Col span={6}>
              <Button loading={false} onClick={this._downloadFiles}>
                <Icon type="download" />
                Download
              </Button>
            </Col>
          </Row>
          <Row>
            <Table
              rowKey="name"
              dataSource={fusionIsoforms}
              columns={columns}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => this._onSelectRow(record)
                };
              }} />
          </Row>
        </Fragment>
        : null
    )
  }

  _downloadFiles() {
    var zip = new JSZip();

    zip.file("Hello.", "hello.txt");

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      saveAs(blob, "hello.zip");
    });
    // console.log(data)
  }

  _scrollToPlot() {
    const { plotRef } = this.state;

    plotRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  _filterFusions(fusion, onlyCanonical) {
    var fusionIsoforms = null;

    fusionIsoforms = Object.keys(fusion.transcripts).map(val => {
      return fusion.transcripts[val]
    });

    if (onlyCanonical) {
      fusionIsoforms = fusionIsoforms.filter(val => val.canonical);
    }

    return fusionIsoforms;
  }

  _createPlotDate(fusionTranscript) {
    var plotDataAll = {
      fusionProtein: null,
      gene1Protein: null,
      gene2Protein: null,
      fusionExon: null,
      gene1Exon: null,
      gene2Exon: null
    };

    if (fusionTranscript.hasProteinCodingPotential) {
      plotDataAll.fusionProtein = new PlotFusionProtein(fusionTranscript);
    }

    if (fusionTranscript.transcript1.isProteinCoding) {
      plotDataAll.gene1Protein = new PlotWTProtein(fusionTranscript.transcript1);
    }

    if (fusionTranscript.transcript2.isProteinCoding) {
      plotDataAll.gene2Protein = new PlotWTProtein(fusionTranscript.transcript2);
    }

    plotDataAll.fusionExon = new PlotFusionExons(fusionTranscript);
    plotDataAll.gene1Exon = new PlotWTExons(fusionTranscript.transcript1);
    plotDataAll.gene2Exon = new PlotWTExons(fusionTranscript.transcript2);

    this.setState({
      selectedFusionTranscript: fusionTranscript,
      plotDataAll: plotDataAll
    });
  }

  _onSelectRow(fusionTranscript) {
    this._scrollToPlot();
    this._createPlotDate(fusionTranscript)
  }

  _onChangeCanonical() {
    var onlyCanonical = !this.state.onlyCanonical;
    this.setState({
      onlyCanonical: onlyCanonical,
    });
  }
}

export default FusionTableDetail;