import React from "react";
import {
  Form,
  Row,
  Col,
  Card,
  Select,
  Button,
  Upload,
  Tooltip,
  message,
  Progress,
} from "antd";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import "./DataForm.css";

import { ProcessQuery } from "../library/utils/ProcessQuery";
import { AVAILABLE_ENSEMBL_SPECIES } from "../library/utils/utils";
import { UPLOAD_FORMATS } from "../library/utils/utils";
import { parseUpload } from "../library/upload/base";
import { ErrorModal } from "./ErrorModal.jsx";

const { Dragger } = Upload;
const helpText = {
  format:
    "Generic format has one fusion per row (either TSV or CSV) with this format: gene1,gene1Junction,gene2,gene2Junction (e.g. FGFR2,121487991,CCDC6,59807078)",
};

export default class BulkDataForm extends React.Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      query: new ProcessQuery(),
      loading: false,
      uploadedFusionData: null,
      disabled: true,
      species: "homo_sapiens_hg38",
      release: 94,
      format: "Generic CSV",
      progress: null,
      showModal: false,
      errorMsg: null,
      fileList: [],
    };
  }

  componentDidMount() {
    this._resetForm();
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
      fileList,
      errorMsg,
    } = this.state;

    var ensembleVersionsOptions = {};

    Object.keys(AVAILABLE_ENSEMBL_SPECIES).map((val) => {
      ensembleVersionsOptions[val] = AVAILABLE_ENSEMBL_SPECIES[val][
        "ensembl_releases"
      ].map((rel) => {
        return <Select.Option key={rel}>{rel}</Select.Option>;
      });
    });

    const speciesOption = Object.keys(AVAILABLE_ENSEMBL_SPECIES).map((val) => {
      return (
        <Select.Option key={val}>
          {AVAILABLE_ENSEMBL_SPECIES[val]["display"]}
        </Select.Option>
      );
    });

    const uploadFormats = UPLOAD_FORMATS.map((val) => {
      return <Select.Option key={val}>{val}</Select.Option>;
    });

    const props = {
      name: "file",
      multiple: false,
      customRequest: this._uploadRequest,
      onChange: this._onUploadChange,
      fileList: fileList,
      iconRender: (file, listType) => {},
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
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
        layout={"vertical"}
      >
        <Row gutter={14}>
          <Col xs={24} lg={16}>
            <Card className="dragger" title="Upload" bordered={true}>
              <Dragger {...props}>
                <div className="ant-upload-drag-icon">
                  <InboxOutlined />
                </div>
                <div className="ant-upload-text">
                  Click or drag file to this area to upload
                </div>
              </Dragger>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              className="Card-input"
              title="Other information"
              bordered={true}
            >
              <Form.Item
                label={
                  <div>
                    Upload format
                    <Tooltip className="Tooltip" title={helpText.format}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </div>
                }
                name="upload_format"
                className="form-item"
                rules={[{ required: true }]}
              >
                <Select style={{ minWidth: "10rem" }}>{uploadFormats}</Select>
              </Form.Item>

              <Form.Item
                label="Species"
                name="species"
                className="form-item"
                rules={[{ required: true }]}
              >
                <Select onChange={this._handleSpeciesChange}>
                  {speciesOption}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ensembl release"
                name="release"
                className="form-item"
                rules={[{ required: true }]}
              >
                <Select onChange={this._handleReleaseChange}>
                  {ensembleVersionsOptions[species]}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
        <br />
        <Row className="row-input">
          <Button
            disabled={disabled}
            htmlType="submit"
            type="primary"
            className="button"
            loading={loading}
          >
            Submit
          </Button>
          <Button type="default" className="button" onClick={this._clearData}>
            Clear
          </Button>
        </Row>
        <Row>
          {progress ? (
            <Progress className="progress-bar" percent={progress} />
          ) : null}
        </Row>
        {showModal ? (
          <ErrorModal
            errorMsg={errorMsg}
            closeModalCallback={this._closeModal}
          />
        ) : null}
      </Form>
    );
  }

  _handleSpeciesChange = (value) => {
    this.formRef.current.setFields([
      {
        name: "species",
        value: value,
      },
      {
        name: "release",
        value: AVAILABLE_ENSEMBL_SPECIES[value]["default_release"],
      },
    ]);
  };

  _handleReleaseChange = (value) => {
    this.formRef.current.setFields([
      {
        name: "release",
        value: value,
      },
    ]);
  };

  _onUploadChange = ({ file, fileList, e }) => {
    if (fileList.length > 1) {
      fileList.shift();
    }

    if (file.status === "done") {
      message.success(`${fileList[0].name} file uploaded successfully.`);
    } else if (file.status === "error") {
      this.setState({
        fileList: [],
      });
      message.error(`${fileList[0].name} file upload failed.`);
    }
  };

  _uploadRequest = ({ file, onSuccess, onError }) => {
    const { format } = this.state;

    setTimeout(async () => {
      const fusionData = await parseUpload(file, format);

      if (fusionData.errorMsg.length === 0 && fusionData.fusions.length !== 0) {
        file.status = "done";
        this.setState({
          uploadedFusionData: fusionData.fusions,
          disabled: false,
          fileList: [file],
        });
        onSuccess();
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

  _closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  _handleFormatChange = (value) => {
    this.setState({
      format: value,
    });
  };

  _resetForm = () => {
    this.formRef.current.setFields([
      {
        name: "species",
        value: "homo_sapiens_hg38",
      },
      {
        name: "release",
        value: 94,
      },
      {
        name: "upload_format",
        value: "Generic CSV",
      },
    ]);
  };

  _clearData = () => {
    this._resetForm();

    this.setState({
      loading: false,
      uploadedFusionData: null,
      disabled: true,
      progress: null,
      showModal: false,
      errorMsg: null,
      fileList: [],
    });
    this.props.onClearCallback();
  };

  _setLoading = () => {
    const { loading } = this.state;

    this.setState({
      loading: !loading,
    });
  };

  _onSubmit = async (values) => {
    const { query, uploadedFusionData, progress } = this.state;
    const { rollbar } = this.props;

    const species = AVAILABLE_ENSEMBL_SPECIES[values.species]["species"];
    const speciesRelease = `${species}_${values.release}`;

    var fusions = [];

    this._setLoading();

    for (var i = 0; i < uploadedFusionData.length; i++) {
      var fusion = uploadedFusionData[i];
      var gene1EnsemblIds = null;
      var gene1Data = null;
      var gene1DataFinal = [];
      var gene2EnsemblIds = null;
      var gene2Data = null;
      var gene2DataFinal = [];
      var errorMsg = [];

      // rollbar.info(
      //   'Bulk gene fusion',
      //   `gene1: ${fusion.gene1}, ` +
      //   `gene1Pos: ${fusion.gene1Pos}, ` +
      //   `gene2: ${fusion.gene2}, ` +
      //   `gene2Pos: ${fusion.gene2Pos}`);

      // validate gene 1 and get gene data

      gene1EnsemblIds = await query._validateGene(fusion.gene1, speciesRelease);

      if (gene1EnsemblIds !== null) {
        // fetch the gene/transcirpt data

        gene1Data = await query._getGeneData(gene1EnsemblIds, speciesRelease);

        if (gene1Data.length !== 0) {
          // get genes where junction occurs in

          gene1DataFinal = [];

          for (var j = 0; j < gene1Data.length; j++) {
            if (gene1Data[j].contains(fusion.gene1Pos)) {
              gene1Data[j] = await query._getSequenceData(
                gene1Data[j],
                speciesRelease
              );
              gene1DataFinal.push(gene1Data[j]);
            }
          }

          if (gene1DataFinal.length === 0) {
            errorMsg.push(
              "Junction not within the 5' gene. Check the selected genome."
            );
          }
        } else {
          errorMsg.push(
            "Unknown 5' gene gene. Check your spelling and genome."
          );
        }
      } else {
        errorMsg.push("Unknown 5' gene gene. Check your spelling and genome.");
      }

      // validate gene 2

      gene2EnsemblIds = await query._validateGene(fusion.gene2, speciesRelease);

      if (gene2EnsemblIds !== null) {
        // fetch the gene/transcirpt data

        gene2Data = await query._getGeneData(gene2EnsemblIds, speciesRelease);

        if (gene2Data.length !== 0) {
          // get genes where junction occurs in

          gene2DataFinal = [];

          for (var j = 0; j < gene2Data.length; j++) {
            if (gene2Data[j].contains(fusion.gene2Pos)) {
              gene2Data[j] = await query._getSequenceData(
                gene2Data[j],
                speciesRelease
              );
              gene2DataFinal.push(gene2Data[j]);
            }
          }

          if (gene2DataFinal.length === 0) {
            errorMsg.push(
              "Junction not within the 3' gene. Check the selected genome."
            );
          }
        } else {
          errorMsg.push(
            "Unknown 3' gene gene. Check your spelling and genome."
          );
        }
      } else {
        errorMsg.push("Unknown 3' gene gene. Check your spelling and genome.");
      }

      if (errorMsg.length > 0) {
        fusions.push({
          gene1: fusion.gene1.join(","),
          gene1Data: fusion.gene2.join(","),
          gene1Junction: fusion.gene1Pos,
          gene2: fusion.gene2.join(","),
          gene2Data: fusion.gene2.join(","),
          gene2Junction: fusion.gene2Pos,
          errorMsg: errorMsg,
        });
      } else {
        fusions.push({
          gene1: gene1EnsemblIds,
          gene1Data: gene1DataFinal,
          gene1Junction: fusion.gene1Pos,
          gene2: gene2EnsemblIds,
          gene2Data: gene2DataFinal,
          gene2Junction: fusion.gene2Pos,
          errorMsg: errorMsg,
        });
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
  };
}
