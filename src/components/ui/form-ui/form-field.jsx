'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function FormField({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  type = 'text', 
  required = false,
  readOnly = false,
  sectionName,
  max = null
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(id, e.target.value, sectionName)}
        className={error ? 'border-destructive' : ''}
        readOnly={readOnly}
        max={max}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export { FormField };
