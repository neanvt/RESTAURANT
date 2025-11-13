"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

  // Update otp state when value prop changes
  const updateOtpFromValue = (val: string) => {
    const otpArray = val.padEnd(length, "").split("").slice(0, length);
    setOtp(otpArray);
  };

  // Initialize otp from value
  if (value !== otp.join("")) {
    updateOtpFromValue(value);
  }

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow single digit
    const newDigit = digit.slice(-1);
    if (newDigit && !/^\d$/.test(newDigit)) return;

    const newOtp = [...otp];
    newOtp[index] = newDigit;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Move to next input if digit entered
    if (newDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current input
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const digits = pastedData.replace(/\D/g, "");

    if (digits) {
      const newOtp = digits.padEnd(length, "").split("").slice(0, length);
      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Focus last filled input or last input
      const lastIndex = Math.min(digits.length, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Enter OTP *</Label>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className="w-12 h-12 text-center text-lg font-semibold"
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <p className="text-xs text-gray-500 text-center">
        Enter the 6-digit code sent to your phone
      </p>
    </div>
  );
}
