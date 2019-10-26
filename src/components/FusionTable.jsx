import React, { Fragment } from 'react';
import { Table, Row, Col, Tag, Switch, Icon, Tooltip, Popover, Select } from 'antd';

import Plot from './Plot.jsx';
import './FusionTable.css';

import { PlotWTExons } from '../library/plot/PlotWTExons';
import { PlotFusionExons } from '../library/plot/PlotFusionExons';
import { PlotWTProtein } from '../library/plot/PlotWTProtein';
import { PlotFusionProtein } from '../library/plot/PlotFusionProtein';

const { Option } = Select;

const helpText = {
  canonical: "By default, only the canonical isoform for each gene in the fusion are shown. Each gene has one canonical isoform, which usually represents the biologically most interesting isoform as well as having the longest coding sequence."
};

class FusionTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onlyCanonical: true,
      selectedFusion: null,
      selectedFusionTranscript: null,
      plotDataAll: null,
    };

    this._onChangeCanonical = this._onChangeCanonical.bind(this);
    this._onSelectRow = this._onSelectRow.bind(this);
  }

  componentDidMount() {
    const { fusions, defaultFusion } = this.props;
    console.log(fusions[defaultFusion]);
    var fusionIsoforms = this._filterFusions(fusions, defaultFusion, true);
    this._createPlotDate(fusionIsoforms[0]);
  }

  render() {


    const { selectedFusionTranscript, plotDataAll, onlyCanonical } = this.state;
    var { selectedFusion } = this.state;
    const { fusions, defaultFusion, width } = this.props;

    selectedFusion = selectedFusion || defaultFusion;

    var fusionIsoforms = this._filterFusions(fusions, selectedFusion, onlyCanonical);

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
      fusions ?
        <Fragment>
          <hr/>
          <Row>
            <Plot selectedFusion={selectedFusionTranscript} plotDataAll={plotDataAll} width={width}/>
          </Row>
          <hr/>
          <Row className="Controls">
            <Col span={6}>
              <span className="HelpText">Selected gene fusion:</span>
              <Select defaultValue={defaultFusion}>
                {Object.keys(fusions).map(val => {
                  return <Option key={val} value={val}>{fusions[val].displayName}</Option>;
                })}
              </Select>
            </Col>
            <Col span={6}>
              Show only canonical
              <Tooltip className="Tooltip" title={helpText.canonical}>
                <Icon type="question-circle" />
              </Tooltip>: <Switch checked={onlyCanonical} onChange={this._onChangeCanonical}/>
            </Col>
            <Col span={6} />
            <Col span={6} />
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

  _filterFusions(fusions, selectedFusion, onlyCanonical) {
    var fusionIsoforms = null;

    if (selectedFusion) {
      fusionIsoforms = Object.keys(fusions[selectedFusion].transcripts).map(val => fusions[selectedFusion].transcripts[val]);
      if (onlyCanonical) {
        fusionIsoforms = fusionIsoforms.filter(val => val.canonical);
      }
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
    this._createPlotDate(fusionTranscript)
  }

  _onChangeCanonical() {
    var onlyCanonical = !this.state.onlyCanonical;
    this.setState({
      onlyCanonical: onlyCanonical,
    });
  }
}

export default FusionTable;