export function DataStatus({
  source,
  updatedAt,
  refreshing,
}: {
  source: string;
  updatedAt: number;
  refreshing: boolean;
}) {
  if (updatedAt === 0) return null;
  return (
    <p className="data-status" role="status">
      <span aria-hidden="true" />
      {source} data · Updated{" "}
      {new Date(updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
      {refreshing ? " · Refreshing" : ""}
    </p>
  );
}
