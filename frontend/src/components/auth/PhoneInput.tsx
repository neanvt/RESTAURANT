"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  error,
  disabled,
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (input.length <= 10) {
      onChange(input);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 5) {
      return phone;
    }
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Phone Number *
      </Label>
      <div className="relative">
        <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="bg-gray-50 px-3 py-3 border-r text-sm font-medium text-gray-600">
            +91
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={focused ? value : formatPhoneNumber(value)}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={11}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        Enter your 10-digit Indian mobile number
      </p>
    </div>
  );
}
