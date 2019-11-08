export class BaseUpload {
  constructor(file) {
    this.file = file;
    this.fusions = [];
    this.errorMsg = [];
  }

  async preprocess() {

    var lines = await this.file.text().then(text => {

      var lines = null;

      if (text === undefined || text === '') {
        this.errorMsg.push('File is empty!');
      } else {
        lines = text.split('\n');
      }

      // skip empty rows such as trailing newline

      lines = lines.filter(val => val !== '');

      return lines;
    });

    return lines;
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