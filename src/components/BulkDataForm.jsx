import React, { Fragment } from 'react';
import {Row, Col, Card, Select, Button, Upload, Icon, Tooltip, message, Progress } from 'antd';

import './DataForm.css';

import { DynamoDB } from '../library/utils/DynamoDB';
import { ProcessQuery } from '../library/utils/ProcessQuery';
import { AVAILABLE_ENSEMBL_SPECIES } from '../library/utils/utils';
import { UPLOAD_FORMATS } from '../library/utils/utils';
import { parseUpload } from '../library/upload/base';
import { ErrorModal } from './ErrorModal';

const { Dragger } = Upload;
const helpText = {
  format: "Generic upload format has one fusion per row, where each row has a comma-separated list with this format: gene1,gene1Junction,gene2,gene2Junction (e.g. FGFR2,121487991,CCDC6,59807078)",
};

class BulkDataForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      query: new ProcessQuery(),
      loading: false,
      uploadedFusionData: null,
      disabled: true,
      species: 'homo_sapiens_hg38',
      release: 94,
      format: 'Generic',
      progress: null,
      showModal: false,
      errorMsg: null,
    }

    this._onSubmit = this._onSubmit.bind(this);
    this._clearData = this._clearData.bind(this);
    this._setLoading = this._setLoading.bind(this);
    this._handleSpeciesChange = this._handleSpeciesChange.bind(this);
    this._handleReleaseChange = this._handleReleaseChange.bind(this);
    this._handleFormatChange = this._handleFormatChange.bind(this);
    this._uploadRequest = this._uploadRequest.bind(this);
    this._closeModal = this._closeModal.bind(this);
  }

  render() {

    const {
      loading,
      disabled,
      species,
      release,
      progress,
      showModal,
      uploadedFusionData,
      errorMsg } = this.state;

    var ensembleVersionsOptions = {};

    Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      ensembleVersionsOptions[val] = AVAILABLE_ENSEMBL_SPECIES[val]['ensembl_releases'].map(rel => {
        return <Select.Option key={rel}>{rel}</Select.Option>;
      });
    })

    const speciesOption = Object.keys(AVAILABLE_ENSEMBL_SPECIES).map(val => {
      return <Select.Option key={val}>{AVAILABLE_ENSEMBL_SPECIES[val]['display']}</Select.Option>;
    });

    const uploadFormats = UPLOAD_FORMATS.map(val => {
      return <Select.Option key={val}>{val}</Select.Option>;
    });

    const props = {
      name: 'file',
      multiple: false,
      customRequest: this._uploadRequest,
      onChange(info) {
        const { status } = info.file;
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          info.fileList.pop();
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    return (
      <Fragment>
        <Row gutter={16}>
          <Col span={16}>
            <Card className="Card-input" title="Upload" bordered={true}>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
              </Dragger>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="Card-input" title="Other information" bordered={true}>
              <Fragment>
                <label>Upload format:
                  <Tooltip className="Tooltip" title={helpText.format}>
                    <Icon type="question-circle" />
                  </Tooltip>:
                </label>
                <Select
                  style={{ width: 200 }}
                  onChange={this._handleFormatChange}
                  defaultValue="Generic">
                  {uploadFormats}
                </Select>
                <br />
                <label>Species:</label>
                <Select
                  style={{ width: 200 }}
                  onChange={this._handleSpeciesChange}
                  defaultValue="homo_sapiens_hg38">
                  {speciesOption}
                </Select>
                <br />
                <label>Ensembl release:</label>
                <Select
                  style={{ width: 200 }}
                  onChange={this._handleReleaseChange}
                  defaultValue="94">
                  {ensembleVersionsOptions[species]}
                </Select>
              </Fragment>
            </Card>
          </Col>
        </Row>
        <br />
        <Row className="row-input">
          <Button
            disabled={disabled}
            type="primary"
            className="button"
            onClick={this._onSubmit}
            loading={loading}>
            Submit
          </Button>
          <Button type="default" className="button" onClick={this._clearData}>Clear</Button>
        </Row>
        <Row>
          {progress ? <Progress percent={progress}/> : null}
        </Row>
        {showModal ? <ErrorModal errorMsg={errorMsg} closeModalCallback={this._closeModal}/> : null}
      </Fragment>
    )
  }

  _uploadRequest({file, onSuccess, onError}) {

    const { format } = this.state;

    setTimeout(async () => {
      const fusionData = await parseUpload(file, format);

      if (fusionData.errorMsg.length === 0) {
        onSuccess();
        this.setState({
          uploadedFusionData: fusionData.fusions,
          disabled: false,
        });
      } else {
        onError();
        this.setState({
          errorMsg: fusionData.errorMsg,
          disabled: true,
          showModal: true,
        });
      }

    }, 0);
  };

  _closeModal() {
    console.log('boo')
    this.setState({
      showModal: false,
    });
  }

  _handleFormatChange(value) {
    this.setState({
      format: value,
    });
  }

  _handleSpeciesChange(value) {
    this.setState({
      species: value,
      release: AVAILABLE_ENSEMBL_SPECIES[value]['default_release'],
    });
  }

  _handleReleaseChange(value) {
    this.setState({
      release: value,
    });
  }

  _clearData() {
    this.props.onClearCallback();
  }

  _setLoading() {

    const { loading } = this.state;

    this.setState({
      loading: !loading,
    })
  }

  async _onSubmit() {

    const { query, species, release, uploadedFusionData, progress } = this.state;
    const speciesName = AVAILABLE_ENSEMBL_SPECIES[species]['species'];
    const speciesRelease = `${speciesName}_${release}`;
    var fusions = [];

    this._setLoading();

    for (var i = 0; i < uploadedFusionData.length; i++) {

      var fusion = uploadedFusionData[i];
      var gene1 = null;
      var gene1Data = null;
      var gene1DataFinal = [];
      var gene2 = null;
      var gene2Data = null;
      var gene2DataFinal = [];
      var errorMsg = [];

      // validate gene 1 and get gene data

      gene1 = await query._validateGene(fusion.gene1, speciesRelease);

      if (gene1 !== null) {
        // fetch the gene/transcirpt data

        gene1Data = await query._getGeneData(gene1, speciesRelease);

        if (gene1Data.length !== 0) {
          // get genes where junction occurs in

          gene1DataFinal = []

          for (var j = 0; j < gene1Data.length; j++) {
            if (gene1Data[j].contains(fusion.gene1Pos)) {
              gene1Data[j] = await query._getSequenceData(gene1Data[j], speciesRelease);
              gene1DataFinal.push(gene1Data[j]);
            }
          }

          if (gene1DataFinal.length === 0) {
            errorMsg.push('Junction not within the 5\' gene. Check the selected genome.');
          }
        } else {
          errorMsg.push('Unknown 5\'gene gene. Check your spelling and genome.');
        }
      } else {
        errorMsg.push('Unknown 5\'gene gene. Check your spelling and genome.');
      }

      // validate gene 2

      gene2 = await query._validateGene(fusion.gene2, speciesRelease);

      if (gene2 !== null) {
        // fetch the gene/transcirpt data

        gene2Data = await query._getGeneData(gene2, speciesRelease);

        if (gene2Data.length !== 0) {
          // get genes where junction occurs in

          gene2DataFinal = []

          for (var j = 0; j < gene2Data.length; j++) {
            if (gene2Data[j].contains(fusion.gene2Pos)) {
              gene2Data[j] = await query._getSequenceData(gene2Data[j], speciesRelease);
              gene2DataFinal.push(gene2Data[j]);
            }
          }

          if (gene2DataFinal.length === 0) {
            errorMsg.push('Junction not within the 3\' gene. Check the selected genome.');
          }
        } else {
          errorMsg.push('Unknown 3\'gene gene. Check your spelling and genome.');
        }
      } else {
        errorMsg.push('Unknown 3\'gene gene. Check your spelling and genome.');
      }

      if (errorMsg.length > 0) {
        fusions.push({
          gene1: fusion.gene1,
          gene1Data: fusion.gene2,
          gene1Junction: fusion.gene1Pos,
          gene2: gene2,
          gene2Data: gene2DataFinal,
          gene2Junction: fusion.gene2Pos,
          errorMsg: errorMsg});
      } else {
        fusions.push({
          gene1: gene1,
          gene1Data: gene1DataFinal,
          gene1Junction: fusion.gene1Pos,
          gene2: gene2,
          gene2Data: gene2DataFinal,
          gene2Junction: fusion.gene2Pos,
          errorMsg: errorMsg});
      }

      this.setState({
        progress: 100 * ((i + 1) / uploadedFusionData.length),
      });
    }

    // got here so data is valid

    fusions = query.createFusions(fusions);

    this._setLoading();
    setTimeout(() => {
      this.setState({
        progress: null,
      });
    }, 1000);
    this.props.onSubmitCallback(fusions);
  }
}

export default BulkDataForm;