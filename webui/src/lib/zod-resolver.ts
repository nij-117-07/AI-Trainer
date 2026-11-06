import { zodResolver as originalZodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export function zodResolver<T extends z.ZodTypeAny, FieldValues extends z.input<T>>(
  schema: T,
) {
  return originalZodResolver(schema as any) as any;
}
