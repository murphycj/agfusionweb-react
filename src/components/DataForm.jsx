import React from 'react';
import {Form, Input, InputNumber, Row, Col, Card, Select, Button } from 'antd';

import './DataForm.css';

import { DynamoDB } from '../library/DynamoDB';
import { Gene } from '../library/Gene';
import { AVAILABLE_ENSEMBL_SPECIES } from '../library/utils';

class Data extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ddb: new DynamoDB(),
      loading: false,
    }

    this._onSubmit = this._onSubmit.bind(this);
    this._validateGene = this._validateGene.bind(this);
    this._clearData = this._clearData.bind(this);
    this._runExample = this._runExample.bind(this);
    this._setLoading = this._setLoading.bind(this);
    this._handleSpeciesChange = this._handleSpeciesChange.bind(this);
    this._handleReleaseChange = this._handleReleaseChange.bind(this);
  }

  componentDidMount() {

    this.props.form.setFieldsValue({
      species: 'homo_sapiens_hg38',
      release: 94
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    const { species, release } = this.props.form.getFieldsValue;

    var ensembleVersionsOptions = {};

    Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      ensembleVersionsOptions[val] = AVAILABLE_ENSEMBL_SPECIES[val]['ensembl_releases'].map(rel => {
        return <Select.Option key={rel}>{rel}</Select.Option>;
      });
    })

    const speciesOption = Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      return <Select.Option key={val}>{AVAILABLE_ENSEMBL_SPECIES[val]['display']}</Select.Option>;
    });

    return (
      <Form onSubmit={this._onSubmit}>
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
              <label>Species:</label>
              <Form.Item>
                {getFieldDecorator('species', {
                })(
                  <Select style={{ width: 200 }} onChange={this._handleSpeciesChange}>
                    {speciesOption}
                  </Select>
                )}
              </Form.Item>
              <br />
              <br />
              <label>Ensembl release:</label>
              <Form.Item>
                {getFieldDecorator('release', {
                })(
                  <Select style={{ width: 200 }} onChange={this._handleReleaseChange}>
                    {ensembleVersionsOptions[species]}
                  </Select>
                )}
              </Form.Item>
            </Card>
          </Col>
        </Row>
        <br />
        <Row className="row-input">
          <Form.Item>
            <Button type="primary" className="button" htmlType="submit" loading={loading}>Submit</Button>
            <Button type="default" className="button" onClick={this._clearData}>Clear</Button>
            <Button type="default" className="button" onClick={this._runExample}>Run example</Button>
          </Form.Item>
        </Row>
      </Form>
    )
  }

  _handleSpeciesChange(value) {
    this.props.form.setFieldsValue({
      species: value,
      release: AVAILABLE_ENSEMBL_SPECIES[value]['default_release'],
    });
  }

  _handleReleaseChange(value) {
    this.props.form.setFieldsValue({
      release: value,
    });
  }

  _clearData() {
    this.props.form.resetFields();
    this.props.onClearCallback();
  }

  _runExample() {

    this.props.form.setFields({
      gene1: {value: 'FGFR2'},
      gene1_breakpoint: {value: 121487991},
      gene2: {value: 'CCDC6'},
      gene2_breakpoint: {value: 59807078},
      species: {value: 'homo_sapiens_hg38'},
      release: {value: 94}
    });
    this._onSubmit(new Event('submit'));
  }

  _setLoading() {

    const { loading } = this.state;

    this.setState({
      loading: !loading,
    })
  }

  async _onSubmit(e) {

    this._setLoading();

    e.preventDefault();

    this.props.form.validateFields( async (err, values) => {
      if (!err) {

        const species = AVAILABLE_ENSEMBL_SPECIES[values.species]['species'];
        const speciesRelease = `${species}_${values.release}`;


        // validate gene 1 and get gene data

        var gene1 = await this._validateGene(values.gene1, speciesRelease)

        if (gene1 === undefined) {
          this.props.form.setFields({
            gene1: {
              value: values.gene1,
              errors: [new Error('Not a valid gene!')],
            },
          });
          this._setLoading();
          return;
        }

        // fetch the gene/transcirpt data

        var gene1Data = await this._getGeneData(gene1, speciesRelease);

        if (gene1Data.length === 0) {
          this.props.form.setFields({
            gene1: {
              value: values.gene1,
              errors: [new Error('Cannot fetch gene data!')],
            },
          });
          this._setLoading();
          return;
        }

        // get genes where junction occurs in

        var gene1DataFinal = []

        for (var i = 0; i < gene1Data.length; i++) {
          if (gene1Data[i].contains(values.gene1_breakpoint)) {
            gene1Data[i] = await this._getSequenceData(gene1Data[i], speciesRelease);
            gene1DataFinal.push(gene1Data[i]);
          }
        }

        // if no genes left, then raise error

        if (gene1DataFinal.length === 0) {
          this.props.form.setFields({
            gene1_breakpoint: {
              value: values.gene1_breakpoint,
              errors: [new Error('Position not within the gene!')],
            },
          });
          this._setLoading();
          return;
        }

        // validate gene 2

        var gene2 = await this._validateGene(values.gene2, speciesRelease)

        if (gene2 === undefined) {
          this.props.form.setFields({
            gene2: {
              value: values.gene2,
              errors: [new Error('Not a valid gene!')],
            },
          });
          this._setLoading();
          return;
        }

        // fetch the gene/transcirpt data

        var gene2Data = await this._getGeneData(gene2, speciesRelease);

        if (gene2Data.length === 0) {
          this.props.form.setFields({
            gene2: {
              value: values.gene2,
              errors: [new Error('Cannot fetch gene data!')],
            },
          });
          this._setLoading();
          return;
        }

        // get genes where junction occurs in

        var gene2DataFinal = []

        for (var i = 0; i < gene2Data.length; i++) {
          if (gene2Data[i].contains(values.gene2_breakpoint)) {
            gene2Data[i] = await this._getSequenceData(gene2Data[i], speciesRelease);
            gene2DataFinal.push(gene2Data[i]);
          }
        }

        // if no genes left, then raise error

        if (gene2DataFinal.length === 0) {
          this.props.form.setFields({
            gene2_breakpoint: {
              value: values.gene2_breakpoint,
              errors: [new Error('Position not within the gene!')],
            },
          });
          this._setLoading();
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
        this._setLoading);
      }
    });
  }

  async _getSequenceData(gene, speciesRelease) {

    const { ddb } = this.state;


    // fetch the sequences

    var seqs = await ddb.getSequences(gene.getSeqIds(), speciesRelease);

    gene.parseSeqs(seqs);

    return gene;
  }

  async _getGeneData(gene, speciesRelease) {

    const { ddb } = this.state;

    var ensemblIds = gene.ensembl_gene_id.S.split(';');
    var geneData = [];

    for (var i = 0; i < ensemblIds.length; i++) {
      var geneData_i = await ddb.getGene(ensemblIds[i], speciesRelease);
      if (geneData_i !== undefined) {
        geneData.push(new Gene(ensemblIds[i], geneData_i));
      }
    }

    return geneData;
  }

  async _validateGene(gene_id, speciesRelease) {

    const { ddb } = this.state;

    var gene = await ddb.getGeneSynonym(gene_id, speciesRelease);

    if (gene === undefined) {
      return
    } else {
      return gene;
    }
  }
}

const DataForm = Form.create({ name: 'fusion_data' })(Data);
export default DataForm;