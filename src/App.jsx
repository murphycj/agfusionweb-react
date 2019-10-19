import React, {Component, Fragment} from 'react';
import 'antd/dist/antd.css';
// import logo from './logo.svg';
import './App.css';
import { Layout, Row, Col, Spin} from 'antd';
const { Header, Footer, Content } = Layout;

import DataForm from './components/DataForm.jsx';
import { Fusion } from './library/Fusion';
import FusionTable from './components/FusionTable.jsx';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ensembl: null,
      fusions: null
    }

    this._onSubmit = this._onSubmit.bind(this);
    this._onClear = this._onClear.bind(this);
  }

  render() {

    const { fusions } = this.state;

    return (
      <Layout >
        <Header>
          <div className="logo" style={{color: 'white'}}>AGFusion | Annotate Gene Fusions</div>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 300 }}>
            <DataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
            <hr/>
            <FusionTable fusions={fusions} />
          </div>
        </Content>
        <Footer className="App-footer">
          <a href="https://github.com/murphycj/AGFusion">AGFusion on GitHub </a>
          | {'\u00A9'} 2019 Charlie Murphy
        </Footer>
      </Layout>
    );
  }

  _onClear() {
    this.setState({
      fusions: null,
    });
  }

  _onSubmit(fusionData, setLoadingCallback) {

    console.log(fusionData);

    var fusions = [];
    for (var i = 0; i < fusionData.gene1Data.length; i++) {
      for (var j = 0; j < fusionData.gene2Data.length; j++) {
        fusions.push(new Fusion(
          fusionData.gene1Data[i],
          fusionData.gene2Data[j],
          fusionData.gene1Junction,
          fusionData.gene2Junction
        ))
      }
    }

    this.setState({
      fusions: fusions,
    });

    setLoadingCallback();
  }
}

export default App;