import React, { Fragment } from 'react';
import {Form, Input, InputNumber, Layout, Row, Col, Card, Select, Button } from 'antd';

import './DataForm.css';

import InputOption from './InputOption.jsx';
import { DynamoDB } from '../library/DynamoDB';
import { Gene } from '../library/Gene';
import { AVAILABLE_ENSEMBL_SPECIES } from '../library/utils';

class Data extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ddb: new DynamoDB(),
      loading: false,
      selectedSpecies: 'homo_sapiens',
      selectedRelease: 94,
    }

    this._onSubmit = this._onSubmit.bind(this);
    this._validateGene = this._validateGene.bind(this);
    this._clearData = this._clearData.bind(this);
    this._runExample = this._runExample.bind(this);
    this._setLoading = this._setLoading.bind(this);
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const { selectedRelease, selectedSpecies, loading } = this.state;

    var ensembleVersions = {};

    Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      ensembleVersions[val] = AVAILABLE_ENSEMBL_SPECIES[val]['ensembl_releases'].map(rel => {
        return <Select.Option key={rel}>{rel}</Select.Option>;
      });
    })

    const species = Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
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
                  options={ensembleVersions[selectedSpecies]}
                  default="94"
                  />
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

        // validate gene 1 and get gene data

        var gene1 = await this._validateGene(values.gene1)

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

        var gene1Data = await this._getGeneData(gene1);

        if (gene1Data.length == 0) {
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
            gene1Data[i] = await this._getSequenceData(gene1Data[i]);
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
          this._setLoading();
          return;
        }

        // validate gene 2

        var gene2 = await this._validateGene(values.gene2)

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

        var gene2Data = await this._getGeneData(gene2);

        if (gene2Data.length == 0) {
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
            gene2Data[i] = await this._getSequenceData(gene2Data[i]);
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

  async _getSequenceData(gene) {

    const { ddb } = this.state;
    var seqIds = [];

    // get the transcript and protein sequnce ids

    for (var i = 0; i < gene.transcripts.length; i++) {
      seqIds.push(gene.transcripts[i].id);

      if (gene.transcripts[i].proteinId !== undefined) {
        seqIds.push(gene.transcripts[i].proteinId);
      }
    }

    // fetch the sequences

    var seqs = await ddb.getSequences(seqIds);
    var seqsProcessed = {};

    for (var i = 0; i < seqs.length; i++) {
      var seqId = seqs[i].id.S;
      var seq = seqs[i].sequence.S || '';
      seqsProcessed[seqId] = seq;
    }

    // add the sequences to the transcripts

    for (var i = 0; i < gene.transcripts.length; i++) {

      if (gene.transcripts[i].id in seqsProcessed) {
        gene.transcripts[i].cdnaSeq = seqsProcessed[gene.transcripts[i].id];
        gene.transcripts[i].parseSeqs();
      }

      if (gene.transcripts[i].proteinId in seqsProcessed) {
        gene.transcripts[i].proteinSeq = seqsProcessed[gene.transcripts[i].proteinId];
      }

    }

    return gene;
  }

  async _getGeneData(gene) {

    const { ddb } = this.state;

    var ensemblIds = gene.ensembl_gene_id.S.split(';');
    var geneData = [];

    for (var i = 0; i < ensemblIds.length; i++) {
      var geneData_i = await ddb.getGene(ensemblIds[i]);
      if (geneData_i !== undefined) {
        geneData.push(new Gene(ensemblIds[i], geneData_i));
      }
    }

    return geneData;
  }

  async _validateGene(gene_id) {

    const { ddb } = this.state;

    var gene = await ddb.getGeneSynonym(gene_id);

    if (gene === undefined) {
      return
    } else {
      return gene;
    }
  }
}

const DataForm = Form.create({ name: 'fusion_data' })(Data);
export default DataForm;