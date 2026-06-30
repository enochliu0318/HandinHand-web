import { cn } from "@/lib/utils";

interface IOSCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function IOSCard({ children, className, padding = true }: IOSCardProps) {
  return (
    <div
      className={cn(
        "bg-ios-card rounded-2xl overflow-hidden shadow-sm",
        padding && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface IOSListProps {
  children: React.ReactNode;
  className?: string;
  header?: string;
  footer?: string;
}

export function IOSList({ children, className, header, footer }: IOSListProps) {
  return (
    <div className={className}>
      {header && (
        <p className="text-xs text-ios-gray uppercase tracking-wide px-4 mb-2">
          {header}
        </p>
      )}
      <div className="bg-ios-card rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
      {footer && (
        <p className="text-xs text-ios-gray px-4 mt-2">{footer}</p>
      )}
    </div>
  );
}

interface IOSListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function IOSListItem({
  children,
  className,
  onClick,
}: IOSListItemProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 ios-separator text-left",
        onClick && "active:bg-ios-gray5 transition-colors",
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface IOSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function IOSButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  disabled,
  ...props
}: IOSButtonProps) {
  const variants = {
    primary: "bg-ios-blue text-white active:opacity-80",
    secondary: "bg-ios-gray5 text-ios-blue active:bg-ios-gray4",
    danger: "bg-ios-red text-white active:opacity-80",
    ghost: "bg-transparent text-ios-blue active:bg-ios-gray5",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 text-base rounded-xl",
    lg: "px-6 py-3.5 text-lg rounded-2xl",
  };

  return (
    <button
      className={cn(
        "font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface IOSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function IOSInput({ label, className, ...props }: IOSInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-1.5 block">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full bg-ios-card rounded-xl px-4 py-3 text-base",
          "border border-ios-gray5 focus:border-ios-blue focus:outline-none",
          "placeholder:text-ios-gray transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface IOSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function IOSSelect({ label, options, className, ...props }: IOSSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-1.5 block">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full bg-ios-card rounded-xl px-4 py-3 text-base appearance-none",
          "border border-ios-gray5 focus:border-ios-blue focus:outline-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface IOSTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function IOSTextarea({ label, className, ...props }: IOSTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-ios-gray uppercase tracking-wide px-1 mb-1.5 block">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full bg-ios-card rounded-xl px-4 py-3 text-base resize-none",
          "border border-ios-gray5 focus:border-ios-blue focus:outline-none",
          "placeholder:text-ios-gray transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface IOSSegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IOSSegmentedControl({
  options,
  value,
  onChange,
  className,
}: IOSSegmentedControlProps) {
  return (
    <div
      className={cn(
        "flex bg-ios-gray5 rounded-xl p-1 gap-0.5",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all",
            value === opt.value
              ? "bg-ios-card text-ios-label shadow-sm"
              : "text-ios-gray"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface IOSBadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "orange" | "gray";
  className?: string;
}

export function IOSBadge({ children, color = "blue", className }: IOSBadgeProps) {
  const colors = {
    blue: "bg-ios-blue/10 text-ios-blue",
    green: "bg-ios-green/10 text-ios-green",
    orange: "bg-ios-orange/10 text-ios-orange",
    gray: "bg-ios-gray5 text-ios-gray",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

interface IOSEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function IOSEmptyState({ icon, title, description }: IOSEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-ios-gray mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-ios-label mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ios-gray max-w-xs">{description}</p>
      )}
    </div>
  );
}
