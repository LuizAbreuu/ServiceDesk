interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-gray-500">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} chamados
      </span>
      <div className="flex gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 text-xs rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                p === page
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 text-xs rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  );
}