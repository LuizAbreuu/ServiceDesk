import { useRef } from 'react';
import { FileText, Download, Upload } from 'lucide-react';
import { useUploadAttachment } from '../../hooks/useTicketDetail';
import type { Attachment } from '../../types';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentSection({
  ticketId,
  attachments,
}: {
  ticketId: string;
  attachments: Attachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUploadAttachment(ticketId);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) mutate(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Anexos ({attachments.length})
      </h3>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-4">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={14} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{a.fileName}</p>
                <p className="text-xs text-gray-400">{formatBytes(a.size)}</p>
              </div>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Download size={14} />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Área de upload */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#6c63ff] hover:bg-purple-50/30 transition-all"
      >
        <Upload size={16} className="mx-auto text-gray-300 mb-2" />
        <p className="text-xs text-gray-400">
          {isPending ? 'Enviando...' : 'Arraste arquivos ou clique para anexar'}
        </p>
        <p className="text-xs text-gray-300 mt-1">Máx. 10 MB por arquivo</p>
      </div>

      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
    </div>
  );
}