export function Progress({ value, className = "" }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div
        className="h-3 rounded-full"
        style={{
          width: `${value}%`,
          backgroundColor: "#800080", // Your primary color
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
