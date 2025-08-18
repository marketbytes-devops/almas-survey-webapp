import { useFormContext } from "react-hook-form";

const Input = ({ label, name, type = "text", options = [], ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-4">
      <label className="block text-[#2d4a5e] text-sm font-medium mb-1">
        {label}
      </label>
      {type === "select" ? (
        <select
          {...register(name, props)}
          className={`w-full p-2 border rounded text-[#2d4a5e] focus:outline-none focus:ring-2 focus:ring-[#4c7085] ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          {...register(name, props)}
          className={`w-full p-2 border rounded text-[#2d4a5e] focus:outline-none focus:ring-2 focus:ring-[#4c7085] ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          rows="4"
        />
      ) : (
        <input
          type={type}
          {...register(name, props)}
          className={`w-full p-2 border rounded text-[#2d4a5e] focus:outline-none focus:ring-2 focus:ring-[#4c7085] ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default Input;