const Input = ({ label, name, type = "text", options = [], register, errors, ...props }) => {
  return (
    <div className="mb-4 sm:mb-5">
      <label className="block text-[#2d4a5e] text-sm sm:text-base font-medium mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <select
          {...register(name, props.rules)}
          className={`w-full p-3 sm:p-2.5 border rounded text-[#2d4a5e] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4c7085] min-h-[44px] ${
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
          {...register(name, props.rules)}
          className={`w-full p-3 sm:p-2.5 border rounded text-[#2d4a5e] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4c7085] min-h-[100px] ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          rows="4"
          {...props}
        />
      ) : (
        <input
          type={type}
          {...register(name, props.rules)}
          className={`w-full p-3 sm:p-2.5 border rounded text-[#2d4a5e] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4c7085] min-h-[44px] ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-sm sm:text-base mt-1.5">{errors[name].message}</p>
      )}
    </div>
  );
};

export default Input;