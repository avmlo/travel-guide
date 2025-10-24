interface ResultsCountProps {
  count: number;
}

export function ResultsCount({ count }: ResultsCountProps) {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {count} {count === 1 ? "destination" : "destinations"}
      </p>
    </div>
  );
}