export class BaseUpload {
  constructor(file) {
    this.file = file;
    this.fusions = [];
    this.errorMsg = [];
  }

  addErrorMsg(line, msg) {
    if (msg) {
      this.errorMsg.push(`Line ${line}: ${msg}`);
    } else {
      this.errorMsg.push(`${line}`);
    }
  }

  checkColumnHeader(line, i, index, columnName) {
    if (line[index] !== columnName) {
      this.addErrorMsg(i+1, `Expected column ${index+1} to be ${columnName}`);
    }
  }

  areThereEnoughColumns(i, minLength, line) {

    if (line.length < minLength) {
      this.addErrorMsg(`Line ${i+1}: does not have enough columns. Expected at least: ${minLength}.`);
      return false;
    }

    return true
  }

  preprocess() {

    var reader = new FileReader();

    var self = this;

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      reader.onload = (e) => {

        var text = e.target.result;
        var lines = null;

        if (text === undefined || text === '') {
          self.errorMsg.push('File is empty!');
        } else {
          lines = text.split('\n');
        }

        // skip empty rows such as trailing newline

        lines = lines.filter(val => val !== '');

        // parse the lines;

        resolve(lines);
      };

      reader.readAsText(self.file);
    });
  }

  _validateInteger(i, pos, name,) {

    // keep as == so the test works
    if (!(parseInt(pos) == pos)) {
      this.errorMsg.push(`Line ${i+1}: ${name} junction must be an integer: ${pos};`);
      return false;
    }

    if (parseInt(pos) <= 0) {
      this.errorMsg.push(`Line ${i+1}: ${name} junction must be a positive integer: ${pos};`);
      return false;
    }

    return true;
  }

  _isEmpty(i, val, name) {

    if (!val) {
      this.errorMsg.push(`Line ${i+1}: ${name} is empty!`);
      return false;
    }

    return true;
  }

  validateData(i, gene1, gene1Pos, gene2, gene2Pos) {

    var isValid = true;

    isValid = isValid && this._isEmpty(i, gene1, '5\' gene');
    isValid = isValid && this._isEmpty(i, gene2, '3\' gene');
    isValid = isValid && this._isEmpty(i, gene1Pos, '5\' gene junction');
    isValid = isValid && this._isEmpty(i, gene2Pos, '3\' gene junction');

    isValid = isValid && this._validateInteger(i, gene1Pos, '5\' gene');
    isValid = isValid && this._validateInteger(i, gene2Pos, '3\' gene');

    return isValid;
  }
}