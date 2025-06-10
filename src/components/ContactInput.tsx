'use client';

import { memo, useState } from 'react';

interface ContactInputProps {
  id: string;
  value: string;
  onChange: (id: string, field: 'name' | 'phoneNumber', value: string) => void;
  placeholder: string;
  type?: 'text' | 'tel';
}

const ContactInput = memo(({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  type = 'text' 
}: ContactInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const field = type === 'tel' ? 'phoneNumber' : 'name';
  
  // Sadece form gönderildiğinde değeri al
  const handleBlur = () => {
    onChange(id, field, localValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (type === 'tel') {
      // Sadece sayısal değerlere izin ver
      const numericValue = newValue.replace(/[^0-9]/g, '');
      
      // Maksimum 10 karakter (Türkiye telefon numarası için)
      if (numericValue.length <= 10) {
        setLocalValue(numericValue);
      }
    } else {
      setLocalValue(newValue);
    }
  };

  return (
    <input
      type={type === 'tel' ? 'text' : type}
      inputMode={type === 'tel' ? 'numeric' : 'text'}
      pattern={type === 'tel' ? '[0-9]*' : undefined}
      name={`${id}-${field}`}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
    />
  );
});

ContactInput.displayName = 'ContactInput';

export default ContactInput; 