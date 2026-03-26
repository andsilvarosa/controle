export interface ParsedBankNotification {
  bankName: string;
  amount: number;
  type: 'expense' | 'income';
}

// Regex cases
const matchers = [
  {
    bank: 'Nubank',
    packages: ['com.nu.production', 'com.nubank'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Transfer[êe]ncia recebida[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Voc[êe] recebeu um Pix[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Você fez uma transfer[êe]ncia[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix recebido[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix enviado[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' }
    ]
  },
  {
    bank: 'Itaú',
    packages: ['com.itau', 'com.itau.uniclass', 'br.com.itau.rockefeller'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Transfer[êe]ncia recebida[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix[\s\S]*?recebido[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?recebido/i, type: 'income' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?realizado/i, type: 'expense' }
    ]
  },
  {
    bank: 'Santander',
    packages: ['com.santander.app', 'br.com.santander.benfy'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix[\s\S]*?recebido[\s\S]*?R\$?\s?([\d.,]+)/i, type: 'income' },
      { regex: /Voc[êe] recebeu um Pix[\s\S]*?R\$?\s?([\d.,]+)/i, type: 'income' },
      { regex: /PIX (?:foi )?enviado[\s\S]*?R\$?\s?([\d.,]+)/i, type: 'expense' }
    ]
  },
  {
    bank: 'Inter',
    packages: ['br.com.intermedium', 'br.com.bancointer', 'com.bancointer.android'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?recebido/i, type: 'income' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?enviado/i, type: 'expense' }
    ]
  },
  {
    bank: 'Bradesco',
    packages: ['com.bradesco', 'br.com.bradesco.next', 'com.bradesco.prime'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix recebido[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix enviado[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Transfer[êe]ncia efetuada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' }
    ]
  },
  {
    bank: 'Banco do Brasil',
    packages: ['br.com.bb.android', 'br.com.bb.next'],
    patterns: [
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?enviado/i, type: 'expense' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?recebido/i, type: 'income' },
      { regex: /Transfer[êe]ncia[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' }
    ]
  },
  {
    bank: 'Mercado Pago',
    packages: ['com.mercadopago.wallet', 'com.mercadolibre'],
    patterns: [
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?enviado/i, type: 'expense' },
      { regex: /Voc[êe] recebeu R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Voc[êe] depositou R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /dinheiro[\s\S]*?dispon[íi]vel[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' }
    ]
  },
  {
    bank: 'C6 Bank',
    packages: ['com.c6bank.app'],
    patterns: [
      { regex: /Compra[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix recebido[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /Pix enviado[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' }
    ]
  },
  {
    bank: 'Caixa',
    packages: ['br.gov.caixa.internet.mobile'],
    patterns: [
      { regex: /Compra aprovada[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?recebido/i, type: 'income' },
      { regex: /Pix[\s\S]*?R\$\s?([\d.,]+)[\s\S]*?enviado/i, type: 'expense' },
      { regex: /Cr[eé]dito realizado[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' }
    ]
  },
  {
    bank: 'PicPay',
    packages: ['com.picpay', 'com.picpay.android'],
    patterns: [
      { regex: /voc[êe] recebeu[\s\S]*?R\$\s?([\d.,]+)/i, type: 'income' },
      { regex: /voc[êe] enviou[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' },
      { regex: /pagamento[\s\S]*?R\$\s?([\d.,]+)/i, type: 'expense' }
    ]
  }
];

export const parseBankNotification = (packageName: string, title: string, text: string): ParsedBankNotification | null => {
  // text from Java side may contain \n now to separate BIG_TEXT and normal TEXT
  const combinedText = `${title}\n${text}`;
  
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
      const genericMatch = combinedText.match(/(?:compra|pix|transfer[êe]ncia)[\s\S]*?R\$?\s?([\d.,]+)/i);
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
