import React, { Fragment } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Icon, Radio, Row, Col, Card, Select, Tooltip, message } from 'antd';

import './Plot.css';

import { COLORS, PDBS } from '../library/utils/utils';
import { ColorModal } from './ColorModal.jsx';

const { Option } = Select;
const helpText = {
  pdb: [
    "pfam: PFAM (pfam.xfam.org)",
    "smart: SMART (smart.embl-heidelberg.de)",
    "superfamily: SUPERFAMILY (supfam.org)",
    "tigrfam: TIGRFAMS (jcvi.org/tigrfams)",
    "pfscan: pfscan (web.expasy.org/pftools/)",
    "tmhmm: transmembrane helices (cbs.dtu.dk/services/TMHMM/)",
    "seg: low complexity regions",
    "ncoils: predicted coiled coils",
    "prints: protein motif fingerprints (130.88.97.239/PRINTS/index.php)",
    "pirsf: PIRSF (proteininformationresource.org/pirwww/dbinfo/pirsf.shtml)",
    "signalp: predicts signal peptids (cbs.dtu.dk/services/SignalP/)"
  ]
};

class Plot extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imageRef: React.createRef(),
      plotTypeProtein: 'fusionProtein',
      plotTypeExon: '',
      pdbs: ['pfam'],
      domainColors: {},
      colorIndex: 0,
      fusionPlotData: null,
      rectShowIndex: null,
      showModal: false,
      domainToColor: null,
    }

    this._downloadImage = this._downloadImage.bind(this);
    this._handleRadioChange = this._handleRadioChange.bind(this);
    this._getPlotData = this._getPlotData.bind(this);
    this._handleRadioChange = this._handleRadioChange.bind(this);
    this._handleColorChange = this._handleColorChange.bind(this);
    this._handlePdbChange = this._handlePdbChange.bind(this);
    this._closeModal = this._closeModal.bind(this);
  }

  render() {

    const {
      plotTypeProtein,
      plotTypeExon,
      imageRef,
      domainColors,
      domainToColor,
      showModal,
      pdbs,
      showImageDownload,
      hoveringOverImageButton,
      rectShowIndex } = this.state;
    var { width } = this.props;
    width = (2 / 3) * width;

    // get plot and domain data
    const returnData = this._getPlotData(plotTypeProtein, plotTypeExon, pdbs);
    const plotData = returnData ? returnData[0] : null;
    const domains = returnData ? returnData[1] : [];

    // get domain names
    var domainsNames = null;
    if (domains) {
      domainsNames = domains.filter(val => pdbs.includes(val.pdb));
      domainsNames = [...new Set(domainsNames.map(val => val.shortName))];
      domainsNames = domainsNames.map(val => <Option key={val}>{val}</Option>);
    }

    var height = 300;

    return (
      <Fragment>
      <Row>
        <Col span={8}>
          <Card title="Plot settings" className="Card-input">
            <Row className="Plot-Settings-Row">
              <div><b>Plot protein: </b></div>
              <div>
                <Radio.Group
                    value={plotTypeProtein}
                    onChange={this._handleRadioChange}
                    className="Plot-Control-Buttons"
                >
                  <Radio.Button value="fusionProtein">Fusion</Radio.Button>
                  <Radio.Button value="gene1Protein">5' gene</Radio.Button>
                  <Radio.Button value="gene2Protein">3' gene</Radio.Button>
                </Radio.Group>
              </div>
            </Row>
            <Row className="Plot-Settings-Row">
              <div>
                <b>Plot exons: </b>
              </div>
              <div>
                <Radio.Group
                    value={plotTypeExon}
                    onChange={this._handleRadioChange}
                    className="Plot-Control-Buttons">
                  <Radio.Button value="fusionExon">Fusion</Radio.Button>
                  <Radio.Button value="gene1Exon">5' gene</Radio.Button>
                  <Radio.Button value="gene2Exon">3' gene </Radio.Button>
                </Radio.Group>
              </div>
            </Row>
            { // for controlling domain colors
              domains ?
              <Row className="Plot-Settings-Row">
                <div>
                  <b>Domain colors: </b>
                </div>
                <div>
                  <Select
                    mode="tags"
                    value={Object.keys(domainColors)}
                    placeholder="Please select"
                    onChange={this._handleColorChange}
                    className="Plot-Control-Buttons"
                  >
                    {domainsNames}
                  </Select>
                </div>
              </Row>
            : null
            }
            { // for controlling which PDBs
              domains ?
              <Row className="Plot-Settings-Row">
                <div>
                  <b>Protein databases</b>
                  <Tooltip className="Tooltip" title={<Fragment>{helpText.pdb.map(val => <div key={val}>{val}</div>)}</Fragment>}>
                    <Icon type="question-circle" />
                  </Tooltip>:
                </div>
                <div>
                  <Select
                    mode="tags"
                    placeholder="Please select"
                    defaultValue={pdbs}
                    onChange={this._handlePdbChange}
                    className="Plot-Control-Buttons"
                  >
                    {PDBS.map(val => <Option key={val}>{val}</Option>)}
                  </Select>
                </div>
              </Row>
            : null
            }
            <Row className="Plot-Settings-Row">
              <b>Download: </b>
              <Button onClick={this._downloadImage}><Icon type="download" />PNG</Button>
            </Row>
          </Card>
        </Col>
        <Col span={16}>
          <Stage className="Plot" width={width} height={height} id={"test"}>
            {plotData ?
            <Fragment>
              <Layer ref={imageRef}>
                <Rect x={0} y={0} width={width} height={height} fill="white" />

                {plotData.body.map((body, index) => {
                  // plots the main body of the protein or exons
                  if (body.type === 'rect') {
                    return <Rect
                              key={index}
                              stroke={body.stroke}
                              x={body.x * width}
                              y={height - body.y * height}
                              width={body.width * width}
                              height={-body.height * height}/>
                  } else {
                    return <Line
                              key={index}
                              stroke={body.color}
                              points={[
                                body.x0*width,
                                height - body.y0*height,
                                body.x1*width,
                                height - body.y1*height]}/>
                  }
                })}

                {plotData.rects.map(rect => {
                  // plots the domains/exons

                  var color = domainColors[rect.shortName] ? domainColors[rect.shortName] : rect.color;

                  return (
                    rect.show ?
                      <Rect
                        key={rect.index}
                        fill={color}
                        onMouseOver = {(e) => {
                          this.setState({rectShowIndex: rect.index});
                        }}
                        onMouseOut = {(e) => {
                          this.setState({rectShowIndex: null});
                        }}
                        x={rect.x * width}
                        y={height - rect.y * height}
                        width={rect.width * width}
                        height={-rect.height * height}/>
                      : null
                    );
                })}

                {plotData.rects.map(rect => {
                  // shows the text of the domain/exon on hover

                  if (rectShowIndex === rect.index && rect.type === 'protein') {

                    var rectStart = rect.x * width;
                    var rectMiddle = (rect.width * width / 2) + rectStart;
                    var rectLengthHalf = rectMiddle - rectStart;

                    return <Text
                            key={rectShowIndex}
                            text={rect.longName + '\n' + `Start: ${rect.start}, End: ${rect.end}`}
                            align="center"
                            sceneFunc = {(ctx, shape) => {
                              ctx.font = '14px Arial';
                              ctx.fillText(
                                shape.textArr[0].text,
                                rectLengthHalf - shape.textWidth/2,
                                shape.textHeight * 0.5
                              );
                              ctx.fillText(
                                shape.textArr[1].text,
                                rectLengthHalf - shape.textWidth/2,
                                shape.textHeight * 2
                              );
                            }}
                            x={rect.x * width - 0.01 * width}
                            y={height - rect.y * height - 0.2 * height}/>
                  } else {
                    return null;
                  }
                })}

                {plotData.rects.map(rect => {
                  // shows the text of the domain/exon

                  var rectStart = rect.x * width;
                  var rectMiddle = (rect.width * width / 2) + rectStart;
                  var rectLengthHalf = rectMiddle - rectStart;

                  return (
                    rect.show ?
                      <Text
                        key={rect.index}
                        text={rect.shortName}
                        align={"center"}
                        verticalAlign="middle"
                        draggable={true}
                        sceneFunc = {(ctx, shape) => {
                          ctx.font = '14px Arial';
                          ctx.fillText(
                            shape.textArr[0].text,
                            rectLengthHalf - shape.textWidth/2,
                            shape.textHeight * 1.1
                          )
                        }}
                        x={rect.x * width}
                        y={height - rect.y * height}
                        height={rect.height * height}/>
                      : null
                      );
                })}

                {plotData.lines.map((line, index) => {
                  // plots the length markers
                  return <Line
                            key={index}
                            stroke="black"
                            points={[
                              line.x0 * width,
                              height - line.y0 * height,
                              line.x1 * width,
                              height - line.y1 * height]}/>
                })}

                {plotData.texts.map((text, index) => {
                  // plots the various texts
                  return <Text
                            key={index}
                            text={text.text}
                            align="center"
                            x={text.x*width}
                            y={height - text.y*height}/>
                })}

              </Layer>
            </Fragment>
            : <Layer>
                <Rect x={0} y={0} width={width} height={height} fill="white" />
                <Text
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  text="Not protein coding"
                  align="center"
                  verticalAlign="middle"/>
              </Layer>}
          </Stage>
        </Col>
      </Row>
      <Row>
        <Col span={8}/>
        <Col span={16}>
          <p>
            <Icon type="info-circle" />
            {" Tips: Hover over domains to view more detailed information. Click to the left of the domain labels to drag them."}
          </p>
        </Col>
      </Row>
      {showModal ? <ColorModal domainToColor={domainToColor} closeModalCallback={this._closeModal}/> : null}
    </Fragment>
    )
  }

  _closeModal(domain=null, color=null) {

    if (!domain) {
      this.setState({
        showModal: false,
      });
    } else {
      var { domainColors } = this.state;
      domainColors[domain] = color;

      this.setState({
        showModal: false,
        domainColors: domainColors,
      });
    }
  }

  _handleColorChange(e) {
    var { domainColors } = this.state;

    var newDomainColors = {};
    var domainToColor = null;

    // get the new domain to color

    for (var i = 0; i < e.length; i++) {
      if (domainColors[e[i]] === undefined) {
        domainToColor = e[i];
        break;
      }
    }

    // remove any unused colors

    Object.keys(domainColors).map(domain => {
      if (e.includes(domain)) {
        newDomainColors[domain] = domainColors[domain];
      }
    });

    this.setState({
      showModal: domainToColor ? true : false,
      domainToColor: domainToColor,
      domainColors: newDomainColors,
    });
  }

  _handlePdbChange(e) {
    this.setState({
      pdbs: e
    });
  }

  _handleRadioChange(e) {
    if (['fusionProtein', 'gene1Protein', 'gene2Protein'].includes(e.target.value)) {
      this.setState({
        plotTypeProtein: e.target.value,
        plotTypeExon: ''
      });
    } else {
      this.setState({
        plotTypeProtein: '',
        plotTypeExon: e.target.value
      });
    }
    this._getPlotData();
  }

  _getPlotData(plotTypeProtein, plotTypeExon, pdbs) {

    var { plotDataAll } = this.props;

    if (!plotDataAll) {
      return null;
    }

    var plotData = null;
    var domains = null;

    if (plotTypeProtein === 'fusionProtein' && plotDataAll.fusionProtein) {
      plotData = this._filterDomains(plotDataAll.fusionProtein, pdbs);
      domains = plotData.rects;
    } else if (plotTypeProtein === 'gene1Protein' && plotDataAll.gene1Protein) {
      plotData = this._filterDomains(plotDataAll.gene1Protein, pdbs);
      domains = plotData.rects;
    } else if (plotTypeProtein === 'gene2Protein' && plotDataAll.gene2Protein) {
      plotData = this._filterDomains(plotDataAll.gene2Protein, pdbs);
      domains = plotData.rects;
    } else if (plotTypeExon === 'fusionExon') {
      plotData = plotDataAll.fusionExon;
    } else if (plotTypeExon === 'gene1Exon') {
      plotData = plotDataAll.gene1Exon;
    } else if (plotTypeExon === 'gene2Exon') {
      plotData = plotDataAll.gene2Exon;
    }

    return [plotData, domains];
  }

  _downloadImage() {
    const { imageRef, plotTypeProtein, plotTypeExon } = this.state;
    const { plotDataAll } = this.props;

    // get the filename

    var plotName = 'plot.png';

    if (plotTypeProtein === 'fusionProtein' && plotDataAll.fusionProtein) {
      plotName = plotDataAll.fusionProtein.transcript.name.replace(' : ', '__') + '.fusion-protein.png';
    } else if (plotTypeProtein === 'gene1Protein' && plotDataAll.gene1Protein) {
      plotName = plotDataAll.gene1Protein.transcript.name + '.protein.png';
    } else if (plotTypeProtein === 'gene2Protein' && plotDataAll.gene2Protein) {
      plotName = plotDataAll.gene2Protein.transcript.name + '.protein.png';
    } else if (plotTypeExon === 'fusionExon') {
      plotName = plotDataAll.fusionProtein.transcript.name.replace(' : ', '__') + '.fusion-exons.png';
    } else if (plotTypeExon === 'gene1Exon') {
      plotName = plotDataAll.gene1Protein.transcript.name + '.exons.png';
    } else if (plotTypeExon === 'gene2Exon') {
      plotName = plotDataAll.gene2Protein.transcript.name + '.exons.png';
    } else {
      message.error("There is nothing to plot.");
      return;
    }

    var canvas = imageRef.current.canvas._canvas;

    if (canvas.msToBlob && navigator.msSaveBlob) {
      // for IE
      var blob = canvas.msToBlob();
      window.navigator.msSaveBlob(blob, plotName);
      
    } else {
      // other browsers

      var dataURL = imageRef.current.toDataURL({ pixelRatio: 3 });
      var link = document.createElement('a');
      link.download = plotName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link.remove();
    }

  }

  _filterDomains(plotData, pdbs) {

    plotData.rects = plotData.rects.map((val) => {
      if (pdbs.includes(val.pdb)) {
        val.show = true;
      } else {
        val.show = false;
      }
      return val;
    });

    return plotData;
  }
}

export default Plot;
