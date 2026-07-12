interface InlineErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function InlineErrorState({
  title,
  description,
  actionLabel = 'Tentar novamente',
  onAction,
}: InlineErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center">
      <h2 className="text-sm font-semibold text-red-800">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-red-700">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
