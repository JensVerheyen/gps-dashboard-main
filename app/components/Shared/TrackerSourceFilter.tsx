type TrackerSource = "All" | "Demo" | "Traccar";

type Props = {
  value: TrackerSource;
  onChange: (value: TrackerSource) => void;
};

export default function TrackerSourceFilter({ value, onChange }: Props) {
  const options: TrackerSource[] = ["All", "Demo", "Traccar"];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg text-sm border ${
            value === option
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}