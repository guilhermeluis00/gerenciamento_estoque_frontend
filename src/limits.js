// ⚠️ Mantenha em sincronia com backend/src/lib/limits.js
export const LIMITS = {
  ACCOUNT_NAME: 100,
  USER_NAME: 100,
  EMAIL: 254,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 72,

  CATEGORY_NAME: 60,

  SUPPLIER_NAME: 120,
  PHONE: 20,
  DOCUMENT: 18, // com pontuação: 00.000.000/0000-00

  PRODUCT_NAME: 120,
  SKU: 40,
  BARCODE: 14,
  DESCRIPTION: 1000,
  PRICE_MAX: 99999999.99,
  QUANTITY_MAX: 999999999,

  MOVEMENT_REASON: 200,
};

// Filtros de digitação: impedem caracteres inválidos já no campo
export const onlyDigits = (v) => v.replace(/\D/g, '');
export const skuChars = (v) => v.replace(/[^A-Za-z0-9._\-/]/g, '');
export const phoneChars = (v) => v.replace(/[^0-9+()\-\s]/g, '');
export const documentChars = (v) => v.toUpperCase().replace(/[^A-Z0-9.\-/]/g, '');
