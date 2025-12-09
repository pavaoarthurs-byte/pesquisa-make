
export const maskCpfCnpj = (value: string): string => {
  // Remove non-digits
  let v = value.replace(/\D/g, "");
  
  // Limit to 14 digits (CNPJ max)
  if (v.length > 14) v = v.slice(0, 14);

  if (v.length > 11) {
    // CNPJ Mask: 00.000.000/0000-00
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // CPF Mask: 000.000.000-00
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  
  return v;
};

export const maskPhone = (value: string): string => {
  // Remove non-digits
  let v = value.replace(/\D/g, "");
  
  // Limit to 11 digits (Mobile max)
  if (v.length > 11) v = v.slice(0, 11);

  // Apply basic DDD formatting
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");

  if (v.length > 10) { 
     // Mobile 11 digits: (XX) XXXXX-XXXX
     // The regex matches (2 digits) space (5 digits) hyphen (4 digits)
     // But since we are replacing progressively, we adjust:
     v = v.replace(/(\d{5})(\d)/, "$1-$2");
  } else { 
     // Landline 10 digits: (XX) XXXX-XXXX
     v = v.replace(/(\d{4})(\d)/, "$1-$2");
  }
  
  return v;
};
