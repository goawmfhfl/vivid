"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, AlertCircle } from "lucide-react";
import { Input } from "../ui/Input";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneField({
  value,
  onChange,
  placeholder, // 현재 사용되지 않음 (각 입력 필드에 하드코딩된 placeholder 사용)
  error,
  disabled = false,
}: PhoneFieldProps) {
  // placeholder는 현재 사용되지 않지만, 인터페이스 호환성을 위해 유지
  void placeholder;
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);

  // value가 변경되면 파트로 분리
  useEffect(() => {
    if (!value) {
      setPart1("");
      setPart2("");
      setPart3("");
      return;
    }

    // 하이픈 제거
    const cleaned = value.replace(/[-\s]/g, "");

    if (cleaned.length <= 3) {
      setPart1(cleaned);
      setPart2("");
      setPart3("");
    } else if (cleaned.length <= 7) {
      setPart1(cleaned.slice(0, 3));
      setPart2(cleaned.slice(3));
      setPart3("");
    } else {
      setPart1(cleaned.slice(0, 3));
      setPart2(cleaned.slice(3, 7));
      setPart3(cleaned.slice(7, 11));
    }
  }, [value]);

  // 파트들을 합쳐서 onChange 호출
  const updatePhone = (p1: string, p2: string, p3: string) => {
    const full = p1 + p2 + p3;
    onChange(full);
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setPart1(val);
    updatePhone(val, part2, part3);

    // 3자리 입력되면 다음 필드로 포커스
    if (val.length === 3 && input2Ref.current) {
      input2Ref.current.focus();
    }
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setPart2(val);
    updatePhone(part1, val, part3);

    // 4자리 입력되면 다음 필드로 포커스
    if (val.length === 4 && input3Ref.current) {
      input3Ref.current.focus();
    }
  };

  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setPart3(val);
    updatePhone(part1, part2, val);
  };

  const handlePart1KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && part1.length === 0 && input1Ref.current) {
      input1Ref.current.blur();
    }
  };

  const handlePart2KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && part2.length === 0 && input2Ref.current) {
      input2Ref.current.blur();
      if (input1Ref.current) {
        input1Ref.current.focus();
      }
    }
  };

  const handlePart3KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && part3.length === 0 && input3Ref.current) {
      input3Ref.current.blur();
      if (input2Ref.current) {
        input2Ref.current.focus();
      }
    }
  };

  return (
    <div>
      <label
        className="block mb-2"
        style={{ color: "#333333", fontSize: "0.9rem" }}
      >
        전화번호
      </label>
      <div className="relative flex items-center gap-1 sm:gap-2">
        <div className="relative min-w-[75px] flex-[0_0_75px] sm:flex-[0_0_90px]">
          <Phone
            className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 z-10"
            style={{ color: "#6B7A6F", opacity: 0.5 }}
          />
          <Input
            ref={input1Ref}
            type="tel"
            value={part1}
            onChange={handlePart1Change}
            onKeyDown={handlePart1KeyDown}
            placeholder="010"
            className="pl-9 sm:pl-11 pr-1 sm:pr-2 text-center text-sm sm:text-base w-full"
            disabled={disabled}
            maxLength={3}
            style={{
              borderColor: error ? "#EF4444" : "#EFE9E3",
              backgroundColor: "white",
            }}
          />
        </div>
        <span
          className="text-sm sm:text-lg flex-shrink-0 px-0.5"
          style={{ color: "#6B7A6F", fontWeight: 500 }}
        >
          -
        </span>
        <Input
          ref={input2Ref}
          type="tel"
          value={part2}
          onChange={handlePart2Change}
          onKeyDown={handlePart2KeyDown}
          placeholder="1234"
          className="px-1.5 sm:px-3 text-center text-sm sm:text-base min-w-[70px] flex-[0_0_70px] sm:flex-[0_0_110px]"
          disabled={disabled}
          maxLength={4}
          style={{
            borderColor: error ? "#EF4444" : "#EFE9E3",
            backgroundColor: "white",
          }}
        />
        <span
          className="text-sm sm:text-lg flex-shrink-0 px-0.5"
          style={{ color: "#6B7A6F", fontWeight: 500 }}
        >
          -
        </span>
        <Input
          ref={input3Ref}
          type="tel"
          value={part3}
          onChange={handlePart3Change}
          onKeyDown={handlePart3KeyDown}
          placeholder="5678"
          className="px-1.5 sm:px-3 text-center text-sm sm:text-base min-w-[70px] flex-[0_0_70px] sm:flex-[0_0_110px]"
          disabled={disabled}
          maxLength={4}
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
