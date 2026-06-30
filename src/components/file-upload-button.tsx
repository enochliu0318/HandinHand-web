"use client";

import { useRef } from "react";
import { IOSButton } from "@/components/ui/ios";
import { Upload } from "lucide-react";

interface FileUploadButtonProps {
  accept: string;
  onSelect: (file: File) => void;
  disabled?: boolean;
  label: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function FileUploadButton({
  accept,
  onSelect,
  disabled,
  label,
  size = "md",
  fullWidth,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
      <IOSButton
        type="button"
        variant="secondary"
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className={`${iconClass} mr-1`} />
        {label}
      </IOSButton>
    </>
  );
}
