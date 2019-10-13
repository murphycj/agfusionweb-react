import React, { Fragment } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Icon, Radio, Row, Col } from 'antd';
import './Plot.css';

import { PlotWTExons } from '../library/PlotWTExons';
import { PlotFusionExons } from '../library/PlotFusionExons';
import { PlotWTProtein } from '../library/PlotWTProtein';
import { PlotFusionProtein } from '../library/PlotFusionProtein';

class Plot extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imageRef: React.createRef(),
      plotTypeProtein: 'fusionProtein',
      plotTypeExon: '',
      pdbs: ['pfam'],
    }

    this.downloadImage = this.downloadImage.bind(this);
    this.hover = this.hover.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
  }

  handleRadioChange(e) {

    this.setState({ plotType: e.target.value });
  }

  hover() {
    console.log('boo')
  }

  downloadImage() {
    console.log(this.state.imageRef);
    var dataURL = this.state.imageRef.current.toDataURL({ pixelRatio: 3 });

    var link = document.createElement('a');
    link.download = 'stage.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();

  }

  render() {

    var isProteinCoding = false;
    const { plotTypeProtein } = this.state;
    const { plotTypeExon } = this.state;
    var plotData = null;

    if (this.props.selectedFusion) {
      if (plotTypeProtein == 'fusionProtein') {

        if (this.props.selectedFusion.hasProteinCodingPotential) {
          var plotData = new PlotFusionProtein(this.props.selectedFusion);
          plotData.rects = plotData.rects.filter((val) => {
            return this.state.pdbs.includes(val.pdb);
          });
        }

      } else if (plotTypeProtein == 'gene1Protein') {

        if (this.props.selectedFusion.transcript1.isProteinCoding) {
          var plotData = new PlotWTProtein(this.props.selectedFusion.transcript1);
          plotData.rects = plotData.rects.filter((val) => {
            return this.state.pdbs.includes(val.pdb);
          });
        }

      } else if (plotTypeProtein == 'gene2Protein') {

        if (this.props.selectedFusion.transcript2.isProteinCoding) {
          var plotData = new PlotWTProtein(this.props.selectedFusion.transcript2);
          plotData.rects = plotData.rects.filter((val) => {
            return this.state.pdbs.includes(val.pdb);
          });
        }

      } else if (plotTypeExon == 'fusionExon') {

        var plotData = new PlotFusionExons(this.props.selectedFusion);

      } else if (plotTypeExon == 'gene1Exon') {

        var plotData = new PlotWTExons(this.props.selectedFusion.transcript1);

      } else if (plotTypeExon == 'gene2Exon') {

        var plotData = new PlotWTExons(this.props.selectedFusion.transcript2);

      }
      console.log(plotData)
    }

    var width = 800;
    var height = 300;


    return (
      this.props.selectedFusion ?
        <Fragment>
          <Row className="Plot-Controls">
            <Col span={18}>
              <Radio.Group
                  value={plotTypeProtein}
                  onChange={(e) => {
                    this.setState({
                      plotTypeProtein: e.target.value,
                      plotTypeExon: ''
                    });
                  }}
                  className="Plot-Control-Buttons">
                <Radio.Button value="fusionProtein">Fusion protein</Radio.Button>
                <Radio.Button value="gene1Protein">5' gene protein</Radio.Button>
                <Radio.Button value="gene2Protein">3' gene protein</Radio.Button>
              </Radio.Group>
              <Radio.Group
                  value={plotTypeExon}
                  onChange={(e) => {
                    this.setState({
                      plotTypeProtein: '',
                      plotTypeExon: e.target.value
                    });
                  }}
                  className="Plot-Controls-Buttons">
                <Radio.Button value="fusionExon">Fusion exons</Radio.Button>
                <Radio.Button value="gene1Exon">5' gene exons</Radio.Button>
                <Radio.Button value="gene2Exon">3' gene exons</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={6}>
              <Button className="Download-Image" onClick={this.downloadImage}><Icon type="download" />PNG</Button>
            </Col>
          </Row>
          {plotData ?
            <Stage className="Plot" width={width} height={height} ref={this.state.imageRef}>
              <Layer>
                <Rect x={0} y={0} width={width} height={height} fill="white" />
                {plotData.body.map((body, index) => {
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
                  return <Rect
                            key={rect.index}
                            fill={rect.color}
                            onMouseOver = {(e) => {console.log('boo')}}
                            x={rect.x * width}
                            y={height - rect.y * height}
                            width={rect.width * width}
                            height={-rect.height * height}/>
                })}
                {plotData.lines.map((line, index) => {
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
                  return <Text
                            key={index}
                            text={text.text}
                            align="center"
                            x={text.x*width}
                            y={height - text.y*height}/>
                })}
              </Layer>
            </Stage>
            : <Stage className="Plot" width={width} height={height} ref={this.state.imageRef}>
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
}

export default Plot;