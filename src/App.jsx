import React from 'react';
import 'antd/dist/antd.css';
// import logo from './logo.svg';
import './App.css';
import { Layout, Tabs, message } from 'antd';

import DataForm from './components/DataForm.jsx';
import BulkDataForm from './components/BulkDataForm.jsx';
import FusionTable from './components/FusionTable.jsx';
import FusionTableDetail from './components/FusionTableDetail.jsx';

const { Header, Footer, Content } = Layout;
const { TabPane } = Tabs;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fusions: null,
      selectedFusion: null,
      selectedFusionTranscript: null,
      activeTableTab: "1",
      tableRef: React.createRef(),
    }
    this.contentRef = React.createRef();

    this._onSubmit = this._onSubmit.bind(this);
    this._onClear = this._onClear.bind(this);
    this._onTableTabClick = this._onTableTabClick.bind(this);
    this._onTableRowClick = this._onTableRowClick.bind(this);
  }

  render() {

    const { fusions, selectedFusion, selectedFusionTranscript, contentRef, activeTableTab, tableRef } = this.state;

    var width = null;
    if (this.contentRef && this.contentRef.current) {
      width = this.contentRef.current.offsetWidth - 48;
    }

    return (
      <Layout >
        <Header>
          <div className="App-logo">
            AGFusion | Annotate Gene Fusions (v1.0-alpha)
            <a href="https://github.com/murphycj/agfusionweb-react/issues" className="App-logo-feedback"> Feedback / requests? </a>
          </div>
        </Header>
        <Content className="App-content">
          <div style={{ background: '#fff', padding: 24}} ref={this.contentRef}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Annotate single fusion" key="1">
                <DataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
              </TabPane>
              <TabPane tab="Bulk upload" key="2">
                <BulkDataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} />
              </TabPane>
            </Tabs>
            {fusions ?
              <Tabs activeKey={activeTableTab} onTabClick={this._onTableTabClick}>
                <TabPane tab="All fusions" key="1">
                  <div ref={tableRef}>
                    <FusionTable
                      fusions={fusions}
                      defaultFusion={selectedFusion}
                      width={width}
                      onTableRowClickCallback={this._onTableRowClick}/>
                  </div>
                </TabPane>
                <TabPane tab="Detail view" key="2">
                  {activeTableTab === "2" ?
                    <FusionTableDetail
                      fusion={fusions[selectedFusion]}
                      defaultFusionTranscript={selectedFusionTranscript}
                      width={width}
                    />
                  : null
                  }
                </TabPane>
              </Tabs>
              : null}
          </div>
        </Content>
        <Footer className="App-footer">
          For research use only |
          <a href="https://github.com/murphycj/AGFusion" className="App-footer-gitub">
            AGFusion Python package
          </a>
          | {'\u00A9'} 2019 Charlie Murphy
        </Footer>
      </Layout>
    );
  }

  _scrollTo() {
    const { tableRef } = this.state;

    tableRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  _onTableRowClick(fusionTranscript) {

    if (fusionTranscript.displayData.errorMsg) {
      message.error(
        "That fusion cannot be viewed due to input error. Hover over the warning icon on the left to see the cause.",
        6)
      return;
    }

    this.setState({
      selectedFusionTranscript: fusionTranscript,
      selectedFusion: fusionTranscript.fusionId,
      activeTableTab: "2",
    });
  }

  _onTableTabClick(e) {
    const { selectedFusion } = this.state;

    if (e === "2" && selectedFusion === null) {
      message.error("Select a fusion in the table to be shown the detail view.")
      return;
    }

    this.setState({
      activeTableTab: e,
    })
  }

  _onClear() {
    this.setState({
      fusions: null,
      selectedFusion: null,
      activeTableTab: "1",
    });
  }

  _onSubmit(fusions) {

    console.log(fusions);

    this.setState({
      fusions: fusions,
    });

    this._scrollTo();
  }
}

export default App;