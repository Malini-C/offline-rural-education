export default function Button({
  children,
  variant = "primary",
  type = "button",
  ...rest
}) {
  return (
    <button type={type} className={`btn btn--${variant}`} {...rest}>
      {children}
    </button>
  );
}
