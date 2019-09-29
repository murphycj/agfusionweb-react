import React, {Component, Fragment} from 'react';
import 'antd/dist/antd.css';
// import logo from './logo.svg';
import './App.css';
import { Layout, Row, Col, Spin} from 'antd';
const { Header, Footer, Sider, Content } = Layout;

import DataForm from './components/DataForm.jsx';
import { DynamoDB } from './library/DynamoDB';
import { Fusion } from './library/Fusion';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ensembl: null,
      ddb: new DynamoDB(),
    }

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(fusionData) {

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

    console.log(fusions[0]);
  }

  render() {
    return (
      <Layout >
        <Header>
          <div className="logo" style={{color: 'white'}}>AGFusion | Annotate Gene Fusions</div>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
            <DataForm onSubmitCallback={this.onSubmit} />
            <Spin />
          </div>
        </Content>
        <Footer className="App-footer">
          <a href="https://github.com/murphycj/AGFusion">AGFusion on GitHub </a>
          | {'\u00A9'} 2019 Charlie Murphy
        </Footer>
      </Layout>
    );
  }
}

export default App;

// <div className="App">
//   <header className="App-header">
//     <p>
//       AGFusion: annotate gene fusions.
//     </p>
//   </header>
// </div>