import React, { Fragment } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Icon, Radio, Row, Col, Card } from 'antd';
import './Plot.css';

import { COLORS } from '../library/utils';

class Plot extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imageRef: React.createRef(),
      layerRef: React.createRef(),
      canvasContainer: React.createRef(),
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
      layerRef,
      rectShowIndex } = this.state;
    var { width } = this.props;
    width = (2 / 3) * width;
    const plotData = this._getPlotData();

    var height = 300;

    return (
      <Row>
        <Col span={8}>
          <Card title="Plot settings" className="Card-input">
            <Row className="Plot-Settings-Row">
              <Col span={6} className="Plot-Settings-Labels">
                <b>Plot protein: </b>
              </Col>
              <Col span={18}>
                <Radio.Group
                    value={plotTypeProtein}
                    onChange={this._handleRadioChange}
                    className="Plot-Control-Buttons">
                  <Radio.Button value="fusionProtein">Fusion</Radio.Button>
                  <Radio.Button value="gene1Protein">5' gene</Radio.Button>
                  <Radio.Button value="gene2Protein">3' gene</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
            <Row className="Plot-Settings-Row">
              <Col span={6} className="Plot-Settings-Labels">
                <b>Plot exons: </b>
              </Col>
              <Col span={18}>
                <Radio.Group
                    value={plotTypeExon}
                    onChange={this._handleRadioChange}
                    className="Plot-Control-Buttons">
                  <Radio.Button value="fusionExon">Fusion</Radio.Button>
                  <Radio.Button value="gene1Exon">5' gene</Radio.Button>
                  <Radio.Button value="gene2Exon">3' gene </Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
            <Row>
              <Button className="Download-Image" onClick={this._downloadImage}><Icon type="download" />PNG</Button>
            </Row>
          </Card>
        </Col>
        <Col span={16}>
          <Stage className="Plot" width={width} height={height} ref={imageRef} id={"test"}>
            {plotData ?
            <Layer ref={layerRef}>
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

                return <Text
                        key={rect.index}
                        text={rect.shortName}
                        align={"center"}
                        verticalAlign="middle"
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
                        height={rect.height * height}/>;
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