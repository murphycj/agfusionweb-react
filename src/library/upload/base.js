import { GenericUpload } from "./GenericUpload";
import { STARFusion } from "./STARFusion";
import { EricScript } from "./EricScript";
import { FusionCatcher } from "./FusionCatcher";
import { FusionMap } from "./FusionMap";
import { MapSplice } from "./MapSplice";
import { TopHatFusion } from "./TopHatFusion";
import { Defuse } from "./Defuse";
import { Chimerascan } from "./Chimerascan";
import { ChimeRScope } from "./ChimeRScope";
import { JAFFA } from "./JAFFA";
import { Bellerophontes } from "./Bellerophontes";
import { FusionInspector } from "./FusionInspector";

async function parseUpload(file, format) {
  var data = null;

  switch (format) {
    case "Generic CSV":
      data = new GenericUpload(file, ",");
      break;
    case "Generic TSV":
      data = new GenericUpload(file, "\t");
      break;
    case "STARFusion":
      data = new STARFusion(file);
      break;
    case "EricScript":
      data = new EricScript(file);
      break;
    case "FusionCatcher":
      data = new FusionCatcher(file);
      break;
    case "FusionMap":
      data = new FusionMap(file);
      break;
    case "MapSplice":
      data = new MapSplice(file);
      break;
    case "TopHatFusion":
      data = new TopHatFusion(file);
      break;
    case "DeFuse":
      data = new Defuse(file);
      break;
    case "Chimerascan":
      data = new Chimerascan(file);
      break;
    case "ChimeRScope":
      data = new ChimeRScope(file);
      break;
    case "JAFFA":
      data = new JAFFA(file);
      break;
    case "Bellerophontes":
      data = new Bellerophontes(file);
      break;
    case "FusionInspector":
      data = new FusionInspector(file);
      break;
    default:
      data = new GenericUpload(file, ",");
  }

  await data.parse();

  if (data.fusions.length === 0) {
    data.addErrorMsg("Could not parse any fusions.");
  }

  return data;
}

export { parseUpload };
