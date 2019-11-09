import { GenericUpload } from './GenericUpload';
import { STARFusion } from './STARFusion';


async function parseUpload(file, format) {
  var data = null;

  switch(format) {
    case 'Generic CSV':
      data = new GenericUpload(file, ',');
      break;
    case 'Generic TSV':
      data = new GenericUpload(file, '\t');
      break;
    case 'STARFusion':
      data = new STARFusion(file, '\t');
      break;
    default:
      data = new GenericUpload(file, ',');
  }

  await data.parse();

  return data;
}

export { parseUpload };