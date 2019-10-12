import React, { Fragment } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Icon } from 'antd';
import './Plot.css';

import { PlotWTExons } from '../library/PlotWTExons';

class Plot extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imageRef: React.createRef(),
    }

    this.downloadImage = this.downloadImage.bind(this);
    this.hover = this.hover.bind(this);
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

    if (this.props.selectedFusion) {
      var plot = new PlotWTExons(this.props.selectedFusion.transcript1);
      console.log(plot)
    }

    var width = 800;
    var height = 300;

    return (
      this.props.selectedFusion ?
        <Fragment>
          <Button onClick={this.downloadImage}><Icon type="download" />PNG</Button>
          <Stage className="Plot" width={width} height={height} ref={this.state.imageRef}>
            <Layer>
              <Rect x={0} y={0} width={width} height={height} fill="white" />
              <Line
                stroke={plot.linesBody[0].color}
                points={[
                  plot.linesBody[0].x0*width,
                  height - plot.linesBody[0].y0*height,
                  plot.linesBody[0].x1*width,
                  height - plot.linesBody[0].y1*height]}
                />
              {plot.rects.map(rect => {
                return <Rect
                          key={rect.x}
                          fill={rect.color}
                          onMouseOver = {(e) => {console.log('boo')}}
                          x={rect.x * width}
                          y={height - rect.y * height}
                          width={rect.width * width}
                          height={-rect.height * height}/>
              })}
              {plot.lines.map(line => {
                return <Line
                          key={line.x0*line.y0}
                          stroke="black"
                          points={[
                            line.x0*width,
                            height - line.y0*height,
                            line.x1*width,
                            height - line.y1*height]}/>
              })}
              {plot.texts.map(text => {
                return <Text
                          key={text.x*text.y}
                          text={text.text}
                          x={text.x*width}
                          y={height - text.y*height}/>
              })}
            </Layer>
          </Stage>
        </Fragment>
      : <Stage className="PlotNone" width={window.innerWidth} height={100}>
          <Layer>
            <Text text="No fusion selected" fontSize={15} />
          </Layer>
        </Stage>
    )
  }
}

export default Plot;