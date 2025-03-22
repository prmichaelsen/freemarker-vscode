import { extensions } from "vscode";

export const extensionId = "freemarker-vscode";
export const qualifiedExtensionId = "prmichaelsen." + extensionId;
const packageJSON =  extensions.getExtension(qualifiedExtensionId)?.packageJSON;
export const extensionVersion = packageJSON.version;
export const extensionName = packageJSON.displayName;
export const extensionPackage = `FreeMarkerVsCode`;