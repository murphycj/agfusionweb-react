import React from 'react';
import 'antd/dist/antd.css';
// import logo from './logo.svg';
import './App.css';
import { Layout, Tabs } from 'antd';

import DataForm from './components/DataForm.jsx';
import BulkDataForm from './components/BulkDataForm.jsx';
import FusionTable from './components/FusionTable.jsx';

const { Header, Footer, Content } = Layout;
const { TabPane } = Tabs;

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
          <div className="logo" style={{color: 'white'}}>AGFusion | Annotate Gene Fusions (v0.1)</div>
        </Header>
        <Content className="App-content">
          <div style={{ background: '#fff', padding: 24}} ref={this.contentRef}>
            <Tabs defaultActiveKey="2">
              <TabPane tab="Annotate single fusion" key="1">
                <DataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
              </TabPane>
              <TabPane tab="Bulk annotate" key="2">
                <BulkDataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
              </TabPane>
            </Tabs>
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

  _onSubmit(fusions) {

    console.log(fusions);

    var defaultFusion = Object.keys(fusions).length === 1 ?
      Object.keys(fusions)[0] : null;

    this.setState({
      fusions: fusions,
      defaultFusion: defaultFusion,
    });
  }
}

export default App;