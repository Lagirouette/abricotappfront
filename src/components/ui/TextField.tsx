type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "date";
};

export default function TextField({ id, name, label, value, onChange, error, type = "text" }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-line focus:border-primary aria-[invalid=true]:border-status-todo h-[53px] rounded-[4px] border bg-white px-4 text-sm outline-none"
      />
      {error && (
        <p id={`${id}-error`} className="text-status-todo text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
