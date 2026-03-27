export interface ParsedBankTransaction {
  amount: number;
  title: string;
  type: 'expense' | 'income';
  bank: string;
  isPaid: boolean;
}

export function parseBankNotification(title: string, text: string, packageName: string): ParsedBankTransaction | null {
  // Identify bank
  let bank = 'Desconhecido';
  if (packageName.includes('nu.production')) bank = 'Nubank';
  else if (packageName.includes('itau')) bank = 'Itaú';
  else if (packageName.includes('intermedium')) bank = 'Inter';
  else if (packageName.includes('bradesco')) bank = 'Bradesco';
  else if (packageName.includes('santander')) bank = 'Santander';

  const fullText = `${title} ${text}`.toLowerCase();
  
  // Extract amount
  // Matches R$ 50,00 or R$50.00 or 50,00
  const amountRegex = /(?:r\$|rs)\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}|\d+\.\d{2})/i;
  const amountMatch = fullText.match(amountRegex);
  
  if (!amountMatch) return null; // If no amount, ignore

  let amountStr = amountMatch[1].replace(/\./g, '').replace(',', '.');
  const amount = parseFloat(amountStr);

  // Extract type
  let type: 'expense' | 'income' = 'expense';
  if (fullText.includes('recebeu') || fullText.includes('transferência recebida') || fullText.includes('pix recebido') || fullText.includes('reembolso')) {
    type = 'income';
  }

  // Extract title/description
  let extractedTitle = 'Nova Transação';
  
  // Nubank examples:
  // "Compra de R$ 50,00 no IFood"
  // "Transferência de R$ 50,00 enviada para Joao"
  // "Pix de R$ 50,00 recebido de Maria"
  if (bank === 'Nubank') {
    if (fullText.includes('compra de')) {
      const match = fullText.match(/no (.*)/i) || fullText.match(/em (.*)/i);
      if (match) extractedTitle = match[1].trim();
    } else if (fullText.includes('enviada para') || fullText.includes('enviado para')) {
      const match = fullText.match(/para (.*)/i);
      if (match) extractedTitle = `Pix para ${match[1].trim()}`;
    } else if (fullText.includes('recebido de')) {
      const match = fullText.match(/de (.*)/i);
      if (match) extractedTitle = `Pix de ${match[1].trim()}`;
    }
  } else if (bank === 'Inter') {
    // Inter examples:
    // "Compra aprovada no valor de R$ 50,00 em IFood"
    if (fullText.includes('compra aprovada')) {
      const match = fullText.match(/em (.*)/i);
      if (match) extractedTitle = match[1].trim();
    }
  }

  // Capitalize title
  extractedTitle = extractedTitle.charAt(0).toUpperCase() + extractedTitle.slice(1);

  return {
    amount,
    title: extractedTitle,
    type,
    bank,
    isPaid: true
  };
}
