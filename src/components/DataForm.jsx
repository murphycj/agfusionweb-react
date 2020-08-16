import React from 'react';
import {Form, Input, InputNumber, Row, Col, Card, Select, Button } from 'antd';

import './DataForm.css';

import { ProcessQuery } from '../library/utils/ProcessQuery';
import { AVAILABLE_ENSEMBL_SPECIES } from '../library/utils/utils';
import { createNewEvent } from '../library/utils/misc';

export default class DataForm extends React.Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      query: new ProcessQuery(),
      loading: false,
      species: 'homo_sapiens_hg38'
    }
  }

  componentDidMount() {
    this.formRef.current.setFields([
      {
        name: "species",
        value: 'homo_sapiens_hg38',
      },
      {
        name: 'release',
        value: 94
      }
    ]);
  }

  render() {

    const { loading, species } = this.state;
    // const { species, release } = this.props.form.getFieldsValue();

    var ensembleVersionsOptions = {};

    Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      ensembleVersionsOptions[val] = AVAILABLE_ENSEMBL_SPECIES[val]['ensembl_releases'].map(rel => {
        return <Select.Option key={rel}>{rel}</Select.Option>;
      });
    })

    const speciesOption = Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      return <Select.Option key={val}>{AVAILABLE_ENSEMBL_SPECIES[val]['display']}</Select.Option>;
    });

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };

    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    return (

      <Form
        {...layout}
        ref={this.formRef}
        onFinish={this._onSubmit}
        onFinishFailed={onFinishFailed}
        layout={'vertical'}
      >
      <Row gutter={14}>
        <Col xs={24} lg={8}>
          <Card className="Card-input" title="5' gene" bordered={true}>
            <Form.Item
              label="Gene name"
              name="gene1"
              className="form-item"
              rules={[{required: true, message: 'Provide a gene.' }]}
            >
              <Input placeholder="FGFR2" />
            </Form.Item>
            <Form.Item
              label="Breakpoint"
              name="gene1_breakpoint"
              className="form-item"
              rules={[{required: true, type: 'number', min: 0, message: 'Provide a positive integer.' }]}
            >
              <InputNumber placeholder="121598458" style={{ width: '100%' }}/>
            </Form.Item>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="Card-input" title="3' gene" bordered={true}>
            <Form.Item
              label="Gene name"
              name="gene2"
              className="form-item"
              rules={[{required: true, message: 'Provide a gene.' }]}
            >
              <Input placeholder="DNM3" />
            </Form.Item>

            <Form.Item
              label="Breakpoint"
              name="gene2_breakpoint"
              className="form-item"
              rules={[{required: true, type: 'number', min: 0, message: 'Provide a positive integer.' }]}
            >
              <InputNumber placeholder="171841498" style={{ width: '100%' }}/>
            </Form.Item>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="Card-input" title="Other information" bordered={true}>

            <Form.Item
              label="Species"
              name="species"
              className="form-item"
              rules={[{required: true}]}
            >
              <Select onChange={this._handleSpeciesChange}>
                {speciesOption}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ensembl release"
              name="release"
              className="form-item"
              rules={[{required: true}]}
            >
              <Select onChange={this._handleReleaseChange}>
                {ensembleVersionsOptions[species]}
              </Select>
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <Row className="row-input">
        <Col xs={24} lg={3} className="dataform-button">
          <Button type="primary" className="button" htmlType="submit" loading={loading}>Submit</Button>
        </Col>
        <Col xs={24} lg={3} className="dataform-button">
          <Button type="default" className="button" onClick={this._clearData}>Clear</Button>
        </Col>
        <Col xs={24} lg={3} className="dataform-button">
          <Button type="default" className="button" onClick={this._runExample}>Run example</Button>
        </Col>
      </Row>
    </Form>
    )
  }

  _handleSpeciesChange = (value) => {
    this.formRef.current.setFields([
      {
        name: "species",
        value: value,
      },
      {
        name: 'release',
        value: AVAILABLE_ENSEMBL_SPECIES[value]['default_release']
      }
    ]);
  }

  _handleReleaseChange = (value) => {
    this.formRef.current.setFields([
      {
        name: 'release',
        value: value
      }
    ]);
  }

  _clearData = () => {
    this.formRef.current.resetFields();
    this.props.onClearCallback();
  }

  _runExample = () => {

    const values = {
      gene1: 'FGFR2',
      gene1_breakpoint: 121487991,
      gene2: 'CCDC6',
      gene2_breakpoint: 59807078,
      species: 'homo_sapiens_hg38',
      release: 94
    }

    this.formRef.current.setFields([
      {
        name: "gene1",
        value: values.gene1,
      },
      {
        name: 'gene1_breakpoint',
        value: values.gene1_breakpoint
      },
      {
        name: "gene2",
        value: values.gene2,
      },
      {
        name: 'gene2_breakpoint',
        value: values.gene2_breakpoint
      },
      {
        name: 'species',
        value: values.species
      },
      {
        name: 'release',
        value: values.release
      }
    ]);

    // this.props.form.setFields({
    //   gene1: {value: 'FGFR2'},
    //   gene1_breakpoint: {value: 123353224},
    //   gene2: {value: 'FGFR2'},
    //   gene2_breakpoint: {value: 123357479},
    //   species: {value: 'homo_sapiens_hg19'},
    //   release: {value: 75}
    // });
    this._onSubmit(values);
  }

  _setLoading = (loading) => {

    this.setState({
      loading: loading,
    })
  }

  _onSubmit = async (values) => {

    const { query } = this.state;
    const { rollbar } = this.props;

    this._setLoading(true);

    const species = AVAILABLE_ENSEMBL_SPECIES[values.species]['species'];
    const speciesRelease = `${species}_${values.release}`;


    // validate gene 1 and get gene data

    var gene1EnsemblIds = await query._validateGene([values.gene1], speciesRelease)

    if (gene1EnsemblIds === null) {
      this.formRef.current.setFields([
        {
          name: "gene1",
          value: values.gene1,
          errors: ['Not a valid gene!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // fetch the gene/transcirpt data

    var gene1Data = await query._getGeneData(gene1EnsemblIds, speciesRelease);

    if (gene1Data.length === 0) {
      this.formRef.current.setFields([
        {
          name: "gene1",
          value: values.gene1,
          errors: ['Cannot fetch gene data!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // get genes where junction occurs in

    var gene1DataFinal = []

    for (var i = 0; i < gene1Data.length; i++) {
      if (gene1Data[i].contains(values.gene1_breakpoint)) {
        gene1Data[i] = await query._getSequenceData(gene1Data[i], speciesRelease);
        gene1DataFinal.push(gene1Data[i]);
      }
    }

    // if no genes left, then raise error

    if (gene1DataFinal.length === 0) {
      this.formRef.current.setFields([
        {
          name: "gene1_breakpoint",
          value: values.gene1_breakpoint,
          errors: ['Position not within the gene!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // validate gene 2

    var gene2EnsemblIds = await query._validateGene([values.gene2], speciesRelease)

    if (gene2EnsemblIds === null) {
      this.formRef.current.setFields([
        {
          name: "gene2",
          value: values.gene2,
          errors: ['Not a valid gene!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // fetch the gene/transcirpt data

    var gene2Data = await query._getGeneData(gene2EnsemblIds, speciesRelease);

    if (gene2Data.length === 0) {
      this.formRef.current.setFields([
        {
          name: "gene2",
          value: values.gene2,
          errors: ['Cannot fetch gene data!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // get genes where junction occurs in

    var gene2DataFinal = []

    for (var i = 0; i < gene2Data.length; i++) {
      if (gene2Data[i].contains(values.gene2_breakpoint)) {
        gene2Data[i] = await query._getSequenceData(gene2Data[i], speciesRelease);
        gene2DataFinal.push(gene2Data[i]);
      }
    }

    // if no genes left, then raise error

    if (gene2DataFinal.length === 0) {
      this.formRef.current.setFields([
        {
          name: "gene1_breakpoint",
          value: values.gene1_breakpoint,
          errors: ['Position not within the gene!'],
        }
      ]);
      this._setLoading(false);
      return;
    }

    // got here so data is valid

    var fusions = query.createFusions([{
      gene1: gene1EnsemblIds,
      gene1Data: gene1DataFinal,
      gene1Junction: values.gene1_breakpoint,
      gene2: gene2EnsemblIds,
      gene2Data: gene2DataFinal,
      gene2Junction: values.gene2_breakpoint}]);

    this._setLoading(false);
    this.props.onSubmitCallback(fusions);
  }
}


// <Form onSubmit={this._onSubmit}>
//   <Row gutter={16}>
//     <Col xs={24} lg={8}>
//       <Card className="Card-input" title="5' gene" bordered={true}>
//         <div className="input">
//           <label>Gene name:</label>
//           <Form.Item>
//             {getFieldDecorator('gene1', {
//               validateTrigger: 'onSubmit',
//               initialValue: '',
//               rules: [{required: true, message: 'Provide a gene!'}],
//             })(
//               <Input
//                 placeholder="FGFR2"
//                 style={{ width: '50%' }}/>
//             )}
//           </Form.Item>
//         </div>
//         <br />
//         <br />
//         <div className="input">
//           <label>Breakpoint:</label>
//           <Form.Item>
//             {getFieldDecorator('gene1_breakpoint', {
//               rules: [{required: true, message: 'Provide a positive integer for the breakpoint!'}],
//             })(
//               <InputNumber min={0} placeholder="121598458" style={{ width: '50%' }}/>
//             )}
//           </Form.Item>
//         </div>
//       </Card>
//     </Col>
//     <Col xs={24} lg={8}>
//       <Card className="Card-input" title="3' gene" bordered={true}>
//         <div className="input">
//           <label>Gene name:</label>
//           <Form.Item>
//             {getFieldDecorator('gene2', {
//               validateTrigger: 'onSubmit',
//               rules: [{required: true, message: 'Provide a gene!'}],
//             })(
//               <Input placeholder="DNM3" style={{ width: '50%' }}/>
//             )}
//           </Form.Item>
//         </div>
//         <br />
//         <br />
//         <div className="input">
//           <label>Breakpoint:</label>
//           <Form.Item>
//             {getFieldDecorator('gene2_breakpoint', {
//               rules: [{required: true, message: 'Provide a positive integer for the breakpoint!'}],
//             })(
//               <InputNumber min={0} placeholder="171841498" style={{ width: '50%' }}/>
//             )}
//           </Form.Item>
//         </div>
//       </Card>
//     </Col>
//     <Col xs={24} lg={8}>
//       <Card className="Card-input" title="Other information" bordered={true}>
//         <label>Species:</label>
//         <Form.Item>
//           {getFieldDecorator('species', {
//           })(
//             <Select style={{ width: 200 }} onChange={this._handleSpeciesChange}>
//               {speciesOption}
//             </Select>
//           )}
//         </Form.Item>
//         <br />
//         <br />
//         <label>Ensembl release:</label>
//         <Form.Item>
//           {getFieldDecorator('release', {
//           })(
//             <Select style={{ width: 200 }} onChange={this._handleReleaseChange}>
//               {ensembleVersionsOptions[species]}
//             </Select>
//           )}
//         </Form.Item>
//       </Card>
//     </Col>
//   </Row>
//   <br />
//   <Row className="row-input">
//     <Form.Item>
//       <Button type="primary" className="button" htmlType="submit" loading={loading}>Submit</Button>
//       <Button type="default" className="button" onClick={this._clearData}>Clear</Button>
//       <Button type="default" className="button" onClick={this._runExample}>Run example</Button>
//     </Form.Item>
//   </Row>
// </Form>
