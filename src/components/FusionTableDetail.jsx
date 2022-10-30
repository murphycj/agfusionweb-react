import React, { Fragment } from "react";
import {
  Table,
  Row,
  Col,
  Tag,
  Switch,
  Tooltip,
  Popover,
  Divider,
  Button,
} from "antd";
import { QuestionCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import Plot from "./Plot.jsx";
import "./FusionTableDetail.css";

import { PlotWTExons } from "../library/plot/PlotWTExons";
import { PlotFusionExons } from "../library/plot/PlotFusionExons";
import { PlotWTProtein } from "../library/plot/PlotWTProtein";
import { PlotFusionProtein } from "../library/plot/PlotFusionProtein";
import { Download } from "../library/utils/download";

const helpText = {
  canonical:
    "By default, only the canonical isoform for each gene in the fusion are shown. Each gene has one canonical isoform, which usually represents the biologically most interesting isoform as well as having the longest coding sequence.",
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
    const { fusion, defaultFusionTranscript } = this.props;

    selectedFusionTranscript =
      selectedFusionTranscript || defaultFusionTranscript;

    var fusionIsoforms = fusion
      ? this._filterFusions(fusion, onlyCanonical)
      : [];

    const columns = [
      {
        title: <p className="table-col-text">{"5' gene isoform"}</p>,
        dataIndex: "displayData",
        key: "transcript1.id",
        fixed: "left",
        width: 150,
        render: (val) => {
          const contentGene = (
            <div>
              <p>
                <b>ID: </b>
                {val.gene1.id}
              </p>
              <p>
                <b>Biotype: </b>
                {val.gene1.biotype}
              </p>
              <p>
                <b>Complete CDS: </b>
                {val.gene1.complete ? "Yes" : "No"}
              </p>
              <p>
                <b>cDNA length: </b>
                {val.gene1.cdnaLength} bp
              </p>
              <p>
                <b>CDS length: </b>
                {val.gene1.cdsLength ? val.gene1.cdsLength + " bp" : "NA"}
              </p>
              <p>
                <b>Protein length: </b>
                {val.gene1.proteinLength
                  ? val.gene1.proteinLength + " aa"
                  : "NA"}
              </p>
            </div>
          );

          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene1.name}>
                <Tag key={val.gene1.name}>{val.gene1.name}</Tag>
              </Popover>
            </Fragment>
          );
        },
        filters: [
          ...new Set(
            fusionIsoforms.map((val) => {
              return `${val.transcript1.name} / ${val.transcript1.id}`;
            })
          ),
        ].map((val) => {
          return { text: val, value: val };
        }),
        onFilter: (value, record) => {
          var val = `${record.transcript1.name} / ${record.transcript1.id}`;
          return val.indexOf(value) === 0;
        },
      },
      {
        title: <p className="table-col-text">{"3' gene isoform"}</p>,
        dataIndex: "displayData",
        key: "transcript2.id",
        width: 150,
        fixed: "left",
        render: (val) => {
          const contentGene = (
            <div>
              <p>
                <b>ID: </b>
                {val.gene2.id}
              </p>
              <p>
                <b>Biotype: </b>
                {val.gene2.biotype}
              </p>
              <p>
                <b>Complete CDS: </b>
                {val.gene2.complete ? "Yes" : "No"}
              </p>
              <p>
                <b>cDNA length: </b>
                {val.gene2.cdnaLength} bp
              </p>
              <p>
                <b>CDS length: </b>
                {val.gene2.cdsLength ? val.gene2.cdsLength + " bp" : "NA"}
              </p>
              <p>
                <b>Protein length: </b>
                {val.gene2.proteinLength
                  ? val.gene2.proteinLength + " aa"
                  : "NA"}
              </p>
            </div>
          );
          return (
            <Fragment>
              <Popover content={contentGene} title={val.gene2.name}>
                <Tag key={val.gene2.name}>{val.gene2.name}</Tag>
              </Popover>
            </Fragment>
          );
        },
        filters: [
          ...new Set(
            fusionIsoforms.map((val) => {
              return `${val.transcript2.name} / ${val.transcript2.id}`;
            })
          ),
        ].map((val) => {
          return { text: val, value: val };
        }),
        onFilter: (value, record) => {
          var val = `${record.transcript2.name} / ${record.transcript2.id}`;
          return val.indexOf(value) === 0;
        },
      },
      {
        title: <p className="table-col-text">{"Protein effect"}</p>,
        dataIndex: "effect",
        key: "effect",
        width: 150,
        filters: [...new Set(fusionIsoforms.map((val) => val.effect))].map(
          (val) => {
            return { text: val, value: val };
          }
        ),
        onFilter: (value, record) => record.effect === value,
      },
      {
        title: <p className="table-col-text">{"5' junction location"}</p>,
        dataIndex: "gene1JunctionLoc",
        key: "gene1JunctionLoc",
        width: 150,
        filters: [
          ...new Set(fusionIsoforms.map((val) => val.gene1JunctionLoc)),
        ].map((val) => {
          return { text: val, value: val };
        }),
        onFilter: (value, record) => record.gene1JunctionLoc === value,
      },
      {
        title: <p className="table-col-text">{"3' junction location"}</p>,
        dataIndex: "gene2JunctionLoc",
        key: "gene2JunctionLoc",
        width: 150,
        filters: [
          ...new Set(fusionIsoforms.map((val) => val.gene2JunctionLoc)),
        ].map((val) => {
          return { text: val, value: val };
        }),
        onFilter: (value, record) => record.gene2JunctionLoc === value,
      },
      {
        title: (
          <p className="table-col-text">{"Has protein coding potential"}</p>
        ),
        dataIndex: "hasProteinCodingPotential",
        key: "hasProteinCodingPotential",
        render: (val) => (val ? "Yes" : "Unknown"),
        filters: [
          ...new Set(
            fusionIsoforms.map((val) => {
              return val.hasProteinCodingPotential ? "Yes" : "Unknown";
            })
          ),
        ].map((val) => {
          return { text: val, value: val };
        }),
        onFilter: (value, record) => {
          return (
            (record.hasProteinCodingPotential ? "Yes" : "Unknown") === value
          );
        },
      },
    ];

    return fusion ? (
      <Fragment>
        <Divider>Protein and exon plot</Divider>
        <Row ref={plotRef}>
          <Plot
            selectedFusion={selectedFusionTranscript}
            plotDataAll={plotDataAll}
          />
        </Row>
        <Divider>Table of fusion isoforms</Divider>
        <Row className="table-controls">
          <Col xs={24} lg={8} className="table-controls-item">
            <span className="HelpText">
              <b>{"Fusion: "}</b>
              {fusion.displayName}
            </span>
          </Col>
          <Col xs={24} lg={8} className="table-controls-item">
            Show only canonical
            <Tooltip className="Tooltip" title={helpText.canonical}>
              <QuestionCircleOutlined />
            </Tooltip>
            <Switch
              checked={onlyCanonical}
              onChange={this._onChangeCanonical}
            />
          </Col>
          <Col xs={24} lg={8} className="table-controls-item">
            <Button loading={false} onClick={this._downloadFiles}>
              <DownloadOutlined />
              Fusion data
            </Button>
          </Col>
        </Row>
        <Row className="row-table">
          <Table
            rowKey="name"
            dataSource={fusionIsoforms}
            columns={columns}
            pagination={false}
            scroll={{ x: true }}
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => this._onSelectRow(record),
              };
            }}
          />
        </Row>
      </Fragment>
    ) : null;
  }

  _downloadFiles() {
    const { fusion } = this.props;

    var zip = new JSZip();

    var download = new Download(zip, { 1: fusion });

    download.zip.generateAsync({ type: "blob" }).then(function (blob) {
      saveAs(blob, "fusions.zip");
    });
  }

  _scrollToPlot() {
    const { plotRef } = this.state;

    plotRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  _filterFusions(fusion, onlyCanonical) {
    var fusionIsoforms = [];

    fusionIsoforms = Object.keys(fusion.transcripts).map((val) => {
      return fusion.transcripts[val];
    });

    if (onlyCanonical) {
      fusionIsoforms = fusionIsoforms.filter((val) => val.canonical);
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
      gene2Exon: null,
    };

    if (fusionTranscript.hasProteinCodingPotential) {
      plotDataAll.fusionProtein = new PlotFusionProtein(fusionTranscript);
    }

    if (fusionTranscript.transcript1.isProteinCoding) {
      plotDataAll.gene1Protein = new PlotWTProtein(
        fusionTranscript.transcript1
      );
    }

    if (fusionTranscript.transcript2.isProteinCoding) {
      plotDataAll.gene2Protein = new PlotWTProtein(
        fusionTranscript.transcript2
      );
    }

    plotDataAll.fusionExon = new PlotFusionExons(fusionTranscript);
    plotDataAll.gene1Exon = new PlotWTExons(fusionTranscript.transcript1);
    plotDataAll.gene2Exon = new PlotWTExons(fusionTranscript.transcript2);

    this.setState({
      selectedFusionTranscript: fusionTranscript,
      plotDataAll: plotDataAll,
    });
  }

  _onSelectRow(fusionTranscript) {
    this._scrollToPlot();
    this._createPlotDate(fusionTranscript);
  }

  _onChangeCanonical() {
    var onlyCanonical = !this.state.onlyCanonical;
    this.setState({
      onlyCanonical: onlyCanonical,
    });
  }
}

export default FusionTableDetail;
