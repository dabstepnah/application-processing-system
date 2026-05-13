interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => {
  const variantClass =
    variant === "primary"
      ? "bg-appAccent text-black hover:brightness-110"
      : variant === "secondary"
        ? "bg-appHover text-textPrimary hover:bg-zinc-700"
        : "bg-red-600 text-white hover:bg-red-500";

  return <button className={`rounded-xl px-4 py-2 font-medium transition-all duration-200 ${variantClass} ${className}`} {...props} />;
};
