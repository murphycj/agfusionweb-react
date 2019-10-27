import React from 'react';
import 'antd/dist/antd.css';
// import logo from './logo.svg';
import './App.css';
import { Layout } from 'antd';

import DataForm from './components/DataForm.jsx';
import { Fusion } from './library/Fusion';
import FusionTable from './components/FusionTable.jsx';

const { Header, Footer, Content } = Layout;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fusions: null,
      defaultFusion: null,
    }
    this.contentRef = React.createRef();

    this._onSubmit = this._onSubmit.bind(this);
    this._onClear = this._onClear.bind(this);
  }

  render() {

    const { fusions, defaultFusion, contentRef } = this.state;

    var width = null;
    if (this.contentRef && this.contentRef.current) {
      width = this.contentRef.current.offsetWidth - 48;
    }

    return (
      <Layout >
        <Header>
          <div className="logo" style={{color: 'white'}}>AGFusion | Annotate Gene Fusions (Alpha version)</div>
        </Header>
        <Content className="App-content">
          <div style={{ background: '#fff', padding: 24}} ref={this.contentRef}>
            <DataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
            {fusions ?
              <FusionTable fusions={fusions} defaultFusion={defaultFusion} width={width}/>
              : null}
          </div>
        </Content>
        <Footer className="App-footer">
          For research use only |
          <a href="https://github.com/murphycj/AGFusion"> AGFusion on GitHub </a>
          | {'\u00A9'} 2019 Charlie Murphy
        </Footer>
      </Layout>
    );
  }

  _onClear() {
    this.setState({
      fusions: null,
      defaultFusion: null,
    });
  }

  _onSubmit(fusionData, setLoadingCallback) {

    console.log(fusionData);

    var fusions = {};
    var defaultFusion = null;
    for (var i = 0; i < fusionData.gene1Data.length; i++) {
      for (var j = 0; j < fusionData.gene2Data.length; j++) {
        var fusion = new Fusion(
          fusionData.gene1Data[i],
          fusionData.gene2Data[j],
          fusionData.gene1Junction,
          fusionData.gene2Junction
        );

        fusions[fusion.id] = fusion;

        if (j === 0 && i === 0) {
          defaultFusion = fusion.id;
        }
      }
    }

    this.setState({
      fusions: fusions,
      defaultFusion: defaultFusion,
    });

    setLoadingCallback();
  }
}

export default App;