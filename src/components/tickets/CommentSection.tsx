import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Lock } from 'lucide-react';
import { useAddComment } from '../../hooks/useTicketDetail';
import type { Comment } from '../../types';

function avatarColor(name: string) {
  const colors = [
    'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700',     'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',       'bg-green-100 text-green-700',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(name)}`}>
      {initials}
    </div>
  );
}

function CommentBubble({ comment }: { comment: Comment }) {
  const ago = formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true, locale: ptBR });

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} />
      <div className="flex-1">
        <div
          className={`rounded-tl-none rounded-lg p-3 text-sm ${
            comment.isInternal
              ? 'bg-amber-50 border-l-2 border-amber-400'
              : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-800 text-xs">{comment.author.name}</span>
            <span className="text-gray-400 text-xs">{ago}</span>
            {comment.isInternal && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                <Lock size={10} /> nota interna
              </span>
            )}
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({
  ticketId,
  comments,
}: {
  ticketId: string;
  comments: Comment[];
}) {
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const { mutate, isPending } = useAddComment(ticketId);

  const handleSubmit = () => {
    if (!text.trim()) return;
    mutate(
      { content: text.trim(), isInternal },
      { onSuccess: () => { setText(''); setIsInternal(false); } }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Comentários ({comments.length})
      </h3>

      {/* Lista de comentários */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum comentário ainda.</p>
        )}
        {comments.map((c) => <CommentBubble key={c.id} comment={c} />)}
      </div>

      {/* Input */}
      <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#6c63ff] focus-within:ring-1 focus-within:ring-[#6c63ff]/20 transition-all">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Adicionar comentário ou atualização..."
          className="w-full px-4 py-3 text-sm text-gray-700 outline-none resize-none placeholder-gray-400"
        />
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded"
            />
            <Lock size={11} />
            Nota interna (visível apenas para agentes)
          </label>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
            className="flex items-center gap-2 bg-[#1a1a2e] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-40 transition-colors"
          >
            <Send size={12} />
            {isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}