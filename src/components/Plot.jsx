import React, { Fragment } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Icon, Radio, Row, Col } from 'antd';
import './Plot.css';

import { COLORS } from '../library/utils';

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
    }

    this._downloadImage = this._downloadImage.bind(this);
    this._handleRadioChange = this._handleRadioChange.bind(this);
    this._getPlotData = this._getPlotData.bind(this);
    this._handleRadioChange = this._handleRadioChange.bind(this);
  }

  render() {

    const {
      plotTypeProtein,
      plotTypeExon,
      imageRef,
      rectShowIndex } = this.state;
    const plotData = this._getPlotData();

    var width = 800;
    var height = 300;

    return (
      plotData ?
        <Fragment>
          <Row className="Plot-Controls">
            <Col span={18}>
              <Radio.Group
                  value={plotTypeProtein}
                  onChange={this._handleRadioChange}
                  className="Plot-Control-Buttons">
                <Radio.Button value="fusionProtein">Fusion protein</Radio.Button>
                <Radio.Button value="gene1Protein">5' gene protein</Radio.Button>
                <Radio.Button value="gene2Protein">3' gene protein</Radio.Button>
              </Radio.Group>
              <Radio.Group
                  value={plotTypeExon}
                  onChange={this._handleRadioChange}
                  className="Plot-Controls-Buttons">
                <Radio.Button value="fusionExon">Fusion exons</Radio.Button>
                <Radio.Button value="gene1Exon">5' gene exons</Radio.Button>
                <Radio.Button value="gene2Exon">3' gene exons</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={6}>
              <Button className="Download-Image" onClick={this._downloadImage}><Icon type="download" />PNG</Button>
            </Col>
          </Row>
          {plotData ?
            <Stage className="Plot" width={width} height={height} ref={imageRef}>
              <Layer>
                <Rect x={0} y={0} width={width} height={height} fill="white" />

                {plotData.body.map((body, index) => {
                  // plots the main body of the protein or exons
                  if (body.type == 'rect') {
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
                  return <Rect
                            key={rect.index}
                            fill={rect.color}
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
                })}

                {plotData.rects.map(rect => {
                  // shows the text of the domain/exon on hover
                  if (rectShowIndex == rect.index) {
                    return <Text
                            key={rectShowIndex}
                            text={rect.name}
                            align="center"
                            x={rect.x * width - 0.01 * width}
                            y={height - rect.y * height - 0.15 * height}/>
                  } else {
                    return null;
                  }
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
            </Stage>
            : <Stage className="Plot" width={width} height={height} ref={imageRef}>
                <Layer>
                  <Rect x={0} y={0} width={width} height={height} fill="white" />
                  <Text x={width/2} y={height/2} text="Not protein coding" align="center" verticalAlign="middle"/>
                </Layer>
              </Stage>}
        </Fragment>
      : <Stage className="PlotNone" width={window.innerWidth} height={100}>
          <Layer>
            <Text text="No fusion selected" fontSize={15} verticalAlign="middle"/>
          </Layer>
        </Stage>
    )
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

  _getPlotData() {

    const {
      plotTypeProtein,
      plotTypeExon,
      domainColors,
      colorIndex
    } = this.state;
    const { plotData } = this.props;
    var fusionPlot = null;

    if (!plotData) {
      return null;
    }

    if (plotTypeProtein == 'fusionProtein' && plotData.fusionProtein) {
      fusionPlot = this._filterDomains(plotData.fusionProtein);
    } else if (plotTypeProtein == 'gene1Protein' && plotData.gene1Protein) {
      fusionPlot = this._filterDomains(plotData.gene1Protein);
    } else if (plotTypeProtein == 'gene2Protein' && plotData.gene2Protein) {
      fusionPlot = this._filterDomains(plotData.gene2Protein);
    } else if (plotTypeExon == 'fusionExon') {
      fusionPlot = plotData.fusionExon;
    } else if (plotTypeExon == 'gene1Exon') {
      fusionPlot = plotData.gene1Exon;
    } else if (plotTypeExon == 'gene2Exon') {
      fusionPlot = plotData.gene2Exon;
    }

    return fusionPlot;
  }

  _downloadImage() {
    const { imageRef } = this.state;

    console.log(imageRef);
    var dataURL = imageRef.current.toDataURL({ pixelRatio: 3 });

    var link = document.createElement('a');
    link.download = 'stage.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
  }

  _filterDomains(plotData) {
    const { pdbs } = this.state;

    plotData.rects = plotData.rects.filter((val) => {
      return pdbs.includes(val.pdb);
    });

    return plotData;
  }
}

export default Plot;