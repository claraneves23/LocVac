export function isCpfValido(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const calcDv = (slice: string, factorStart: number) => {
    let soma = 0;
    for (let i = 0; i < slice.length; i++) soma += Number(slice.charAt(i)) * (factorStart - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const dv1 = calcDv(digits.substring(0, 9), 10);
  if (dv1 !== Number(digits.charAt(9))) return false;
  const dv2 = calcDv(digits.substring(0, 10), 11);
  return dv2 === Number(digits.charAt(10));
}

export function isCnsValido(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 15) return false;
  const primeiro = digits.charAt(0);
  if ('789'.includes(primeiro)) {
    let soma = 0;
    for (let i = 0; i < 15; i++) soma += Number(digits.charAt(i)) * (15 - i);
    return soma % 11 === 0;
  }
  if ('12'.includes(primeiro)) {
    const pis = digits.substring(0, 11);
    let soma = 0;
    for (let i = 0; i < 11; i++) soma += Number(pis.charAt(i)) * (15 - i);
    const resto = soma % 11;
    const dv = 11 - resto;
    let esperado: string;
    if (dv === 11) {
      esperado = pis + '0000';
    } else if (dv === 10) {
      const soma2 = soma + 2;
      const dv2 = 11 - (soma2 % 11);
      esperado = pis + '001' + dv2;
    } else {
      esperado = pis + '000' + dv;
    }
    return digits === esperado;
  }
  return false;
}

export function isTelefoneValido(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}
