export interface ParsedBankNotification {
  bankName: string;
  amount: number;
  type: 'expense' | 'income';
}

// Regex cases
const matchers = [
  {
    bank: 'Nubank',
    packages: ['com.nu.production'],
    patterns: [
      { regex: /Compra aprovada no seu Nubank.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Transferência recebida.*R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Você fez uma transferência.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix recebido.*R\$\s?([\d.,]+)/i, type: 'income' }
    ]
  },
  {
    bank: 'Itaú',
    packages: ['com.itau'],
    patterns: [
      { regex: /Compra aprovada.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Transferência recebida.*R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix de R\$\s?([\d.,]+).*recebido/i, type: 'income' },
      { regex: /Pix de R\$\s?([\d.,]+).*realizado/i, type: 'expense' }
    ]
  },
  {
    bank: 'Santander',
    packages: ['com.santander.app'],
    patterns: [
      { regex: /Compra aprovada.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix .* recebido .* R\$\s?([\d.,]+)/i, type: 'income' }
    ]
  },
  {
    bank: 'Inter',
    packages: ['br.com.intermedium'],
    patterns: [
      { regex: /Compra aprovada.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix de R\$\s?([\d.,]+) recebido/i, type: 'income' }
    ]
  },
  {
    bank: 'Bradesco',
    packages: ['com.bradesco'],
    patterns: [
      { regex: /Compra aprovada.*R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix recebido.*R\$\s?([\d.,]+)/i, type: 'income' }
    ]
  }
];

export const parseBankNotification = (packageName: string, title: string, text: string): ParsedBankNotification | null => {
  const combinedText = `${title} ${text}`;
  
  for (const matcher of matchers) {
    if (matcher.packages.includes(packageName)) {
      for (const pattern of matcher.patterns) {
        const match = combinedText.match(pattern.regex);
        if (match && match[1]) {
          // Normaliza valor: remove pontos e troca vírgula por ponto
          const rawAmount = match[1].replace(/\./g, '').replace(',', '.');
          const amount = parseFloat(rawAmount);
          if (!isNaN(amount)) {
            return {
              bankName: matcher.bank,
              amount,
              type: pattern.type as 'expense' | 'income'
            };
          }
        }
      }
      
      // Fallback pra banco conhecido mas regex não mapeada 100%
      // Dá pra tentar uma genérica se o pacote é de banco
      const genericMatch = combinedText.match(/(?:compra|pix|transferência).*R\$\s?([\d.,]+)/i);
      if (genericMatch && genericMatch[1]) {
           const rawAmount = genericMatch[1].replace(/\./g, '').replace(',', '.');
           const amount = parseFloat(rawAmount);
           if (!isNaN(amount)) {
             return {
               bankName: matcher.bank,
               amount,
               type: combinedText.toLowerCase().includes('recebid') ? 'income' : 'expense'
             };
           }
      }
    }
  }
  
  return null;
};
