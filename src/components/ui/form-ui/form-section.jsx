'use client';

import { Card } from '@/components/ui/card';
import { FormField } from './form-field';

function FormSection({ title, fields, formData, handleChange, errors, sectionName }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(field => (
          <FormField
            key={field.id}
            id={field.id}
            label={field.label}
            value={formData[field.id]}
            onChange={handleChange}
            error={errors[field.id]}
            type={field.type || 'text'}
            required={field.required}
            readOnly={field.readOnly}
            sectionName={sectionName}
            max={field.max}
          />
        ))}
      </div>
    </Card>
  );
}

export { FormSection };
