import React from 'react';
import 'antd/dist/antd.css';
import './App.css';
import { Layout, Tabs, message, Row, Col, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Rollbar from "rollbar";

import DataForm from './components/DataForm.jsx';
import BulkDataForm from './components/BulkDataForm.jsx';
import FusionTable from './components/FusionTable.jsx';
import FusionTableDetail from './components/FusionTableDetail.jsx';

const { Header, Footer, Content } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      fusions: null,
      selectedFusion: null,
      selectedFusionTranscript: null,
      activeTableTab: "1",
      tableRef: React.createRef(),
      rollbar: new Rollbar({
        accessToken: '5038f24f7a3042a9a3a8784cb526e72c',
        captureUncaught: true,
        captureUnhandledRejections: true,
        crossorigin: "anonymous",
        captureIp: 'anonymize',
      }),
    }
    this.contentRef = React.createRef();

    this._onSubmit = this._onSubmit.bind(this);
    this._onClear = this._onClear.bind(this);
    this._onTableTabClick = this._onTableTabClick.bind(this);
    this._onTableRowClick = this._onTableRowClick.bind(this);
  }

  render() {

    const {
      fusions,
      selectedFusion,
      selectedFusionTranscript,
      contentRef,
      activeTableTab,
      tableRef,
      rollbar,
      } = this.state;

    return (
      <Layout >
        <Header className="ant-header">
          <Row className="App-header App-header-desktop">
            <Col span={12} className="App-header-left">
              <a href="https://github.com/murphycj/agfusionweb-react/" target="_blank" className="App-header-link-name">AGFusion | Annotate Gene Fusions (v1.0.2)</a>
            </Col>
            <Col span={12} className="App-header-right">
              <a href="https://github.com/murphycj/agfusionweb-react/releases" target="_blank" className="App-header-link"> Version history </a>
              <a href="https://github.com/murphycj/agfusionweb-react/issues" target="_blank" className="App-header-link"> Feedback / issues? </a>
            </Col>
          </Row>
          <Row className="App-header App-header-mobile">
            <Col span={12} className="App-header-left">
              <a href="https://github.com/murphycj/agfusionweb-react/" target="_blank" className="App-header-link-name">AGFusion (v1.0.2)</a>
            </Col>
            <Col span={12} className="App-header-right">
              <Menu onClick={this.handleClick} mode="horizontal" theme="dark">
                <SubMenu
                  title={<MenuOutlined />}
                >
                  <Menu.Item key="version">
                    <a href="https://github.com/murphycj/agfusionweb-react/releases" target="_blank" className="App-header-link"> Version history </a>
                  </Menu.Item>
                  <Menu.Item key="feedback">
                    <a href="https://github.com/murphycj/agfusionweb-react/issues" target="_blank" className="App-header-link"> Feedback / issues? </a>
                  </Menu.Item>
                </SubMenu>
              </Menu>
            </Col>
          </Row>
        </Header>
        <Content className="App-content">
          <div style={{ background: '#fff', padding: 24}} ref={this.contentRef}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Annotate single fusion" key="1">
                <DataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} rollbar={rollbar}/>
              </TabPane>
              <TabPane tab="Bulk upload" key="2">
                <BulkDataForm onSubmitCallback={this._onSubmit} onClearCallback={this._onClear} rollbar={rollbar}/>
              </TabPane>
            </Tabs>
            {fusions ?
              <Tabs activeKey={activeTableTab} onTabClick={this._onTableTabClick}>
                <TabPane tab="All fusions" key="1">
                  <div ref={tableRef}>
                    <FusionTable
                      fusions={fusions}
                      defaultFusion={selectedFusion}
                      onTableRowClickCallback={this._onTableRowClick}/>
                  </div>
                </TabPane>
                <TabPane tab="Detail view" key="2">
                  {activeTableTab === "2" ?
                    <FusionTableDetail
                      fusion={fusions[selectedFusion]}
                      defaultFusionTranscript={selectedFusionTranscript}
                    />
                  : null
                  }
                </TabPane>
              </Tabs>
              : null}
          </div>
        </Content>
        <Footer className="App-footer">
          <Row className="App-footer-container">
            <Col xs={24} lg={24} className="app-footer-text">
              For research use only.
            </Col>
            <Col xs={24} lg={24} className="app-footer-text">
              <a href="https://github.com/murphycj/AGFusion" target="_blank">
                Check out the AGFusion Python package.
              </a>
            </Col>
            <Col xs={24} lg={24} className="app-footer-text">
              {'\u00A9'} 2022
              <a href="https://www.linkedin.com/in/murphycharlesj/" style={{marginLeft: "0.5rem"}} target="_blank">
                Charlie Murphy, PhD
              </a>
            </Col>
          </Row>
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

    this.setState({
      fusions: fusions,
    });

    this._scrollTo();
  }
}

export default App;
