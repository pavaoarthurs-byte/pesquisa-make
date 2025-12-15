import { VALID_DDDS } from '../constants';

// Remove all non-numeric characters
const cleanString = (str: string) => str.replace(/\D/g, '');

const isValidCPF = (cpf: string): boolean => {
  if (cpf.length !== 11) return false;
  // Check for known invalid patterns (111.111.111-11, etc.)
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  // Validate 1st digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  // Validate 2nd digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

const isValidCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14) return false;
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  // Validate 1st digit
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Validate 2nd digit
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

export const validateCpfCnpj = (value: string): boolean => {
  const cleanValue = cleanString(value);
  if (cleanValue.length === 11) return isValidCPF(cleanValue);
  if (cleanValue.length === 14) return isValidCNPJ(cleanValue);
  return false;
};

export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  const cleanPhone = cleanString(phone);

  // 1. Verificação de comprimento (Fixo: 10, Móvel: 11)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { 
      isValid: false, 
      message: cleanPhone.length < 10 
        ? "Telefone incompleto (mínimo 10 dígitos)." 
        : "Telefone muito longo (máximo 11 dígitos)." 
    };
  }

  // 2. Verificação de dígitos repetidos (ex: 99999999999)
  if (/^(\d)\1+$/.test(cleanPhone)) {
    return { isValid: false, message: "Número inválido (todos os dígitos iguais)." };
  }

  // 3. Validação do DDD
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (!VALID_DDDS.includes(ddd)) {
    return { isValid: false, message: `DDD ${ddd} desconhecido.` };
  }

  const firstDigit = parseInt(cleanPhone[2]); // O primeiro dígito após o DDD

  // 4. Lógica para Celular (11 dígitos)
  if (cleanPhone.length === 11) {
    if (firstDigit !== 9) {
      return { isValid: false, message: "Celular deve começar com o dígito 9." };
    }
  } 
  
  // 5. Lógica para Fixo (10 dígitos)
  else {
    // Se tem 10 dígitos mas começa com 9, provavelmente o usuário esqueceu um dígito do celular
    if (firstDigit === 9) {
      return { isValid: false, message: "Parece um celular faltando dígito? (11 números)" };
    }
    
    // Telefones fixos no Brasil começam tipicamente de 2 a 5
    if (firstDigit < 2 || firstDigit > 5) {
      return { isValid: false, message: "Telefone fixo deve começar com 2, 3, 4 ou 5." };
    }
  }

  return { isValid: true };
};