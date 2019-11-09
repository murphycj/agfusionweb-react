import { GenericUpload } from './GenericUpload';
import { STARFusion } from './STARFusion';
import { EricScript } from './EricScript';
import { FusionCatcher } from './FusionCatcher';


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
      data = new STARFusion(file);
      break;
    case 'EricScript':
      data = new EricScript(file);
      break;
    case 'FusionCatcher':
      data = new FusionCatcher(file);
      break;
    default:
      data = new GenericUpload(file, ',');
  }

  await data.parse();

  return data;
}

export { parseUpload };