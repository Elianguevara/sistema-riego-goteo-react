/**
 * cn — Class Name utility
 * src/utils/cn.ts
 *
 * Combina nombres de clase filtrando valores falsy.
 * Sin dependencias externas. No requiere clsx ni tailwind-merge.
 *
 * @example
 * cn('btn', isActive && 'btn--active', variant === 'primary' && 'btn--primary')
 * cn(['base', 'text-sm'], hasError && 'field--error')
 */

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[];

function flatten(value: ClassValue): string {
  if (value === null || value === undefined || value === false || value === '') {
    return '';
  }
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return value.map(flatten).filter(Boolean).join(' ');
  }
  return '';
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(flatten).filter(Boolean).join(' ');
}
