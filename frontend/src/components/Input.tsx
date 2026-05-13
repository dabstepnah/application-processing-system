interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <label className="flex flex-col gap-2 text-sm text-textSecondary">
    {label}
    <input
      className="rounded-xl border border-zinc-700 bg-appHover px-3 py-2 text-textPrimary outline-none transition focus:border-appAccent"
      {...props}
    />
  </label>
);
