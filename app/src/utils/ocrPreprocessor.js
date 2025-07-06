export function cleanAndNormalizeText(ocrText) {
  const lines = ocrText
    .split('\n')
    .map(line => line.trim())
    .filter(line => /(\d{1,2}\/\d{1,2}(\/\d{2,4})?)|((R\$|\$)?\s?\d{1,3}(?:[\.,]\d{3})*[\.,]\d{2})/.test(line)
    );

  return lines.map(line => line.replace(/\s{2,}/g, ' ')).join('\n');
}
