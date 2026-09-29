export const ROLES = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
};

export const OPCOES_ROLE = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

export function isAdmin(user) {
  return user?.role === 'ADMIN';
}