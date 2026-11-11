type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "date" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
};

export default function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  required = true,
}: Props) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className="border-line focus:border-primary aria-[invalid=true]:border-status-todo placeholder:text-muted h-[53px] rounded-[4px] border bg-white px-4 text-sm outline-none"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-muted text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-status-todo text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
