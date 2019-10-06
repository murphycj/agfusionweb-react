import React, { Fragment } from 'react';
import {Form, Input, InputNumber, Layout, Row, Col, Card, Select, Button } from 'antd';

import './DataForm.css';

import InputOption from './InputOption.jsx';
import { DynamoDB } from '../library/DynamoDB';
import { Gene } from '../library/Gene';

class Data extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ddb: new DynamoDB(),
      loading: false
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.validateGene = this.validateGene.bind(this);
    this.clearData = this.clearData.bind(this);
    this.runExample = this.runExample.bind(this);
    this.setLoading = this.setLoading.bind(this);
  }

  clearData() {
    this.props.form.resetFields();
    this.props.onClearCallback();
  }

  runExample() {
    this.props.form.setFields({
      gene1: {value: 'FGFR2'},
      gene1_breakpoint: {value: 121487991},
      gene2: {value: 'CCDC6'},
      gene2_breakpoint: {value: 59807078},
    });
    this.onSubmit(new Event('submit'));
  }

  setLoading() {
    var loading = ! this.state.loading;

    this.setState({
      loading: loading,
    })
  }

  async onSubmit(e) {

    this.setLoading();

    e.preventDefault();

    this.props.form.validateFields( async (err, values) => {
      if (!err) {

        // validate gene 1 and get gene data

        var gene1 = await this.validateGene(values.gene1)

        if (gene1 === undefined) {
          this.props.form.setFields({
            gene1: {
              value: values.gene1,
              errors: [new Error('Not a valid gene!')],
            },
          });
          this.setLoading();
          return;
        }

        // fetch the gene/transcirpt data

        var gene1Data = await this.getGeneData(gene1);

        if (gene1Data.length == 0) {
          this.props.form.setFields({
            gene1: {
              value: values.gene1,
              errors: [new Error('Cannot fetch gene data!')],
            },
          });
          this.setLoading();
          return;
        }

        // get genes where junction occurs in

        var gene1DataFinal = []

        for (var i = 0; i < gene1Data.length; i++) {
          if (gene1Data[i].contains(values.gene1_breakpoint)) {
            gene1DataFinal.push(gene1Data[i]);
          }
        }

        // if no genes left, then raise error

        if (gene1DataFinal.length == 0) {
          this.props.form.setFields({
            gene1_breakpoint: {
              value: values.gene1_breakpoint,
              errors: [new Error('Position not within the gene!')],
            },
          });
          this.setLoading();
          return;
        }

        // validate gene 2

        var gene2 = await this.validateGene(values.gene2)

        if (gene2 === undefined) {
          this.props.form.setFields({
            gene2: {
              value: values.gene2,
              errors: [new Error('Not a valid gene!')],
            },
          });
          this.setLoading();
          return;
        }

        // fetch the gene/transcirpt data

        var gene2Data = await this.getGeneData(gene2);

        if (gene2Data.length == 0) {
          this.props.form.setFields({
            gene2: {
              value: values.gene2,
              errors: [new Error('Cannot fetch gene data!')],
            },
          });
          this.setLoading();
          return;
        }

        // get genes where junction occurs in

        var gene2DataFinal = []

        for (var i = 0; i < gene2Data.length; i++) {
          if (gene2Data[i].contains(values.gene2_breakpoint)) {
            gene2DataFinal.push(gene2Data[i]);
          }
        }

        // if no genes left, then raise error

        if (gene2DataFinal.length == 0) {
          this.props.form.setFields({
            gene2_breakpoint: {
              value: values.gene2_breakpoint,
              errors: [new Error('Position not within the gene!')],
            },
          });
          this.setLoading();
          return;
        }

        // got here so data is valid

        this.props.onSubmitCallback({
          gene1: gene1,
          gene1Data: gene1DataFinal,
          gene1Junction: values.gene1_breakpoint,
          gene2: gene2,
          gene2Data: gene2DataFinal,
          gene2Junction: values.gene2_breakpoint},
        this.setLoading);
      }
    });
  }

  async getGeneData(gene) {
    var ensemblIds = gene.ensembl_gene_id.S.split(';');
    var geneData = [];

    for (var i = 0; i < ensemblIds.length; i++) {
      var geneData_i = await this.state.ddb.getGene(ensemblIds[i]);
      if (geneData_i !== undefined) {
        geneData.push(new Gene(ensemblIds[i], geneData_i));
      }
    }

    return geneData;
  }

  async validateGene(gene_id) {

    var gene = await this.state.ddb.getGeneSynonym(gene_id);

    if (gene === undefined) {
      return
    } else {
      return gene;
    }
  }

  render() {

    const { getFieldDecorator } = this.props.form;

    const ensembleVersions = [];
    for (let i = 92; i > 67; i--) {
      ensembleVersions.push(<Option key={i.toString()}>{i}</Option>);
    }

    const species = [
      <Option key="homo_sapiens">Human</Option>,
      <Option key="mus_musculus">Mouse</Option>];

    return (
      <Form onSubmit={this.onSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Card className="Card-input" title="5' gene" bordered={true}>
              <div className="input">
                <label>Gene name:</label>
                <Form.Item>
                  {getFieldDecorator('gene1', {
                    validateTrigger: 'onSubmit',
                    initialValue: '',
                    rules: [{required: true, message: 'Provide a gene!'}],
                  })(
                    <Input
                      placeholder="FGFR2"
                      style={{ width: '50%' }}/>
                  )}
                </Form.Item>
              </div>
              <br />
              <br />
              <div className="input">
                <label>Breakpoint:</label>
                <Form.Item>
                  {getFieldDecorator('gene1_breakpoint', {
                    rules: [{required: true, message: 'Provide a positive integer for the breakpoint!'}],
                  })(
                    <InputNumber min={0} placeholder="121598458" style={{ width: '50%' }}/>
                  )}
                </Form.Item>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="Card-input" title="3' gene" bordered={true}>
              <div className="input">
                <label>Gene name:</label>
                <Form.Item>
                  {getFieldDecorator('gene2', {
                    validateTrigger: 'onSubmit',
                    rules: [{required: true, message: 'Provide a gene!'}],
                  })(
                    <Input placeholder="DNM3" style={{ width: '50%' }}/>
                  )}
                </Form.Item>
              </div>
              <br />
              <br />
              <div className="input">
                <label>Breakpoint:</label>
                <Form.Item>
                  {getFieldDecorator('gene2_breakpoint', {
                    rules: [{required: true, message: 'Provide a positive integer for the breakpoint!'}],
                  })(
                    <InputNumber min={0} placeholder="171841498" style={{ width: '50%' }}/>
                  )}
                </Form.Item>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="Card-input" title="Other information" bordered={true}>
              <Form.Item>
                <InputOption
                  label="Species"
                  options={species}
                  default="homo_sapiens"
                  />
              </Form.Item>
              <br />
              <br />
              <Form.Item>
                <InputOption
                  label="Ensembl version"
                  options={ensembleVersions}
                  default="92"
                  />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        <br />
        <Row className="row-input">
          <Form.Item>
            <Button type="primary" className="button" htmlType="submit" loading={this.state.loading}>Submit</Button>
            <Button type="default" className="button" onClick={this.clearData}>Clear</Button>
            <Button type="default" className="button" onClick={this.runExample}>Run example</Button>
          </Form.Item>
        </Row>
      </Form>
    )
  }
}

const DataForm = Form.create({ name: 'fusion_data' })(Data);
export default DataForm;