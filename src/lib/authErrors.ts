const MAP: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos'],
  [/email not confirmed/i, 'Confirma tu correo antes de continuar'],
  [/too many requests|rate limit/i, 'Demasiados intentos. Espera unos minutos'],
  [/user not found/i, 'No encontramos una cuenta con ese correo'],
  [/expired/i, 'Token expirado'],
  [/password should be at least/i, 'La contraseña debe tener al menos 8 caracteres'],
  [/new password should be different/i, 'La nueva contraseña debe ser distinta a la actual'],
];

export function translateAuthError(message: string | undefined | null): string {
  if (!message) return 'Ocurrió un error inesperado';
  for (const [re, es] of MAP) if (re.test(message)) return es;
  return message;
}
