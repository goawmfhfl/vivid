"use client";

import { AlertCircle, Mail } from "lucide-react";
import { Input } from "../ui/Input";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function EmailField({
  value,
  onChange,
  placeholder = "example@gmail.com",
  error,
  disabled = false,
}: EmailFieldProps) {
  return (
    <div>
      <label
        className="block mb-2"
        style={{ color: "#333333", fontSize: "0.9rem" }}
      >
        이메일
      </label>
      <div className="relative">
        <Mail
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          style={{ color: "#6B7A6F", opacity: 0.5 }}
        />
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-11 pr-4"
          disabled={disabled}
          style={{
            borderColor: error ? "#EF4444" : "#EFE9E3",
            backgroundColor: "white",
          }}
        />
      </div>
      {error && (
        <p
          className="mt-1.5 flex items-center gap-1"
          style={{ color: "#EF4444", fontSize: "0.8rem" }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
