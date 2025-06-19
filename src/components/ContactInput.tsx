'use client';

import { memo } from 'react';

interface ContactInputProps {
  id: string;
  name: string;
  phoneNumber: string;
  onNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ContactInput = memo(({ 
  id, 
  name, 
  phoneNumber, 
  onNameChange, 
  onPhoneNumberChange, 
  onRemove, 
  canRemove 
}: ContactInputProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Sadece sayısal değerlere izin ver
    const numericValue = newValue.replace(/[^0-9]/g, '');
    
    // Maksimum 10 karakter (Türkiye telefon numarası için)
    if (numericValue.length <= 10) {
      onPhoneNumberChange(numericValue);
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1">
        <input
          type="text"
          name={`${id}-name`}
          value={name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ad Soyad"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={`${id}-phoneNumber`}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Telefon Numarası"
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
});

ContactInput.displayName = 'ContactInput';

export default ContactInput; 