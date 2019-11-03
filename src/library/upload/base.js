import { GenericUpload } from './GenericUpload';

async function parseUpload(file, format) {
  var data = null;

  switch(format) {
    case 'Generic':
      data = new GenericUpload(file);
      break;
    default:
      data = new GenericUpload(file);
  }

  await data.parse();

  return data;
}

export { parseUpload };