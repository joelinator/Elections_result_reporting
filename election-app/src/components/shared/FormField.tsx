// src/components/shared/FormField.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { ChangeEvent } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'file';
  options?: { value: string | number; label: string }[]; // For select
  register?: UseFormRegisterReturn;
  error?: FieldError;
  onChange?: (value: string | number | ChangeEvent<HTMLInputElement>) => void; // Keep for compatibility
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void; // Specific for file inputs
  onSelectChange?: (value: string) => void; // Specific for select inputs
}

export function FormField({
  label,
  id,
  type = 'text',
  options,
  register,
  error,
  onChange,
  onFileChange,
  onSelectChange,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {type === 'select' && options ? (
        <Select onValueChange={onSelectChange || ((value) => onChange?.(value))}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea id={id} {...register} />
      ) : type === 'file' ? (
        <Input id={id} type="file" onChange={onFileChange || onChange} />
      ) : (
        <Input id={id} type={type} {...register} onChange={onChange} />
      )}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}