import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, ThumbsUp, Ticket, Pencil, Trash2 } from 'lucide-react';
import type { Article } from '../../types';

const CATEGORY_STYLES: Record<string, string> = {
  'Infraestrutura':  'bg-blue-50 text-blue-700',
  'Software':        'bg-purple-50 text-purple-700',
  'Hardware':        'bg-orange-50 text-orange-700',
  'Acesso & Senhas': 'bg-green-50 text-green-700',
  'Outros':          'bg-gray-100 text-gray-600',
};

const STATUS_STYLES: Record<string, string> = {
  Published: 'bg-green-50 text-green-700',
  Draft:     'bg-gray-100 text-gray-500',
  Archived:  'bg-yellow-50 text-yellow-700',
};

const STATUS_LABELS: Record<string, string> = {
  Published: 'Publicado',
  Draft:     'Rascunho',
  Archived:  'Arquivado',
};

interface Props {
  article: Article;
  onEdit:   (a: Article) => void;
  onDelete: (id: string) => void;
}

export default function ArticleCard({ article, onEdit, onDelete }: Props) {
  const ago = formatDistanceToNow(parseISO(article.updatedAt), { addSuffix: true, locale: ptBR });
  const isDraft = article.status !== 'Published';

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all hover:border-gray-300 cursor-pointer group ${
        isDraft ? 'border-gray-200 opacity-75' : 'border-gray-200'
      }`}
      onClick={() => onEdit(article)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-[#6c63ff] transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>

          {/* Tags + Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[article.status]}`}>
              {STATUS_LABELS[article.status]}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[article.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {article.category}
            </span>
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div
          className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(article)}
            className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(article.id)}
            className="p-1.5 rounded-md border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Métricas (apenas publicados) */}
      {article.status === 'Published' && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={11} /> {article.views.toLocaleString('pt-BR')}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={11} /> {article.helpfulPercent}% útil
          </span>
          <span className="flex items-center gap-1">
            <Ticket size={11} /> {article.linkedTickets} chamados
          </span>
          <span className="ml-auto">Atualizado {ago}</span>
        </div>
      )}
    </div>
  );
}