"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "+91", country: "IN", flag: "\uD83C\uDDEE\uD83C\uDDF3", name: "India" },
  { code: "+1", country: "US", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "United States" },
  { code: "+1", country: "CA", flag: "\uD83C\uDDE8\uD83C\uDDE6", name: "Canada" },
  { code: "+44", country: "GB", flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "United Kingdom" },
  { code: "+49", country: "DE", flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Germany" },
  { code: "+33", country: "FR", flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France" },
  { code: "+61", country: "AU", flag: "\uD83C\uDDE6\uD83C\uDDFA", name: "Australia" },
  { code: "+81", country: "JP", flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "Japan" },
  { code: "+82", country: "KR", flag: "\uD83C\uDDF0\uD83C\uDDF7", name: "South Korea" },
  { code: "+86", country: "CN", flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "China" },
  { code: "+55", country: "BR", flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Brazil" },
  { code: "+52", country: "MX", flag: "\uD83C\uDDF2\uD83C\uDDFD", name: "Mexico" },
  { code: "+971", country: "AE", flag: "\uD83C\uDDE6\uD83C\uDDEA", name: "UAE" },
  { code: "+65", country: "SG", flag: "\uD83C\uDDF8\uD83C\uDDEC", name: "Singapore" },
  { code: "+92", country: "PK", flag: "\uD83C\uDDF5\uD83C\uDDF0", name: "Pakistan" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  disabled?: boolean;
  placeholder?: string;
  onEnterKey?: () => void;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  disabled = false,
  placeholder = "98765 43210",
  onEnterKey,
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative flex overflow-visible rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring/30">
      <button
        type="button"
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-l-xl border-r border-input px-3 py-2.5 text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60"
        disabled={disabled}
      >
        <span>{countryCode.flag}</span>
        <span className="font-medium">{countryCode.code}</span>
        {!disabled && (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>

      {showDropdown && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setShowDropdown(false)}
            onKeyDown={() => setShowDropdown(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-64 overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
            {COUNTRY_CODES.map((c, i) => (
              <button
                key={`${c.country}-${c.code}`}
                type="button"
                onClick={() => {
                  onCountryChange(c);
                  setShowDropdown(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span>{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.code}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <input
        id="phone"
        type="tel"
        value={value}
        onChange={(e) => !disabled && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={disabled}
        className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/65"
        onKeyDown={(e) => e.key === "Enter" && onEnterKey?.()}
      />
    </div>
  );
}
