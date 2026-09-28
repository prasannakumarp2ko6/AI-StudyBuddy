export default function Button({ children, variant = 'primary', size = 'md', loading, ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
