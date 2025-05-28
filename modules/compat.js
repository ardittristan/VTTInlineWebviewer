let mergeObject = foundry?.utils?.mergeObject;
if (mergeObject == undefined) {
  mergeObject = globalThis.mergeObject;
}
export { mergeObject };
