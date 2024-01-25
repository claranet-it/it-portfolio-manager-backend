export function getNameByEmail(email: string): string {
  return email
    .substring(0, email.indexOf('@'))
    .split('.')
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(' ')
}
