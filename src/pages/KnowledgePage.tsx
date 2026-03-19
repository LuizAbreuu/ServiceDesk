import { useState } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import { useArticles, useDeleteArticle } from '../hooks/useKnowledge';
import ArticleCard from '../components/knowledge/ArticleCard';
import Modal from '../components/ui/Modal';
import ArticleEditor from '../components/knowledge/ArticleEditor';
import type { Article } from '../types';
import type { ArticleFilters } from '../services/knowledgeService';

const CATEGORIES = ['Infraestrutura', 'Software', 'Hardware', 'Acesso & Senhas', 'Outros'];

const CATEGORY_ICONS: Record<string, { bg: string; color: string }> = {
  'Infraestrutura':  { bg: 'bg-blue-50',   color: 'text-blue-600'   },
  'Software':        { bg: 'bg-purple-50',  color: 'text-purple-600' },
  'Hardware':        { bg: 'bg-orange-50',  color: 'text-orange-600' },
  'Acesso & Senhas': { bg: 'bg-green-50',   color: 'text-green-600'  },
  'Outros':          { bg: 'bg-gray-100',   color: 'text-gray-500'   },
};

export default function KnowledgePage() {
  const [filters, setFilters]       = useState<ArticleFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();

  const { data: articles = [], isLoading } = useArticles(filters);
  const { mutate: deleteArticle } = useDeleteArticle();

  const published = articles.filter((a) => a.status === 'Published').length;
  const drafts    = articles.filter((a) => a.status === 'Draft').length;

  // Contagem por categoria
  const countByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const openEditor = (article?: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remover este artigo permanentemente?')) {
      deleteArticle(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Base de Conhecimento</h1>
          <p className="text-sm text-gray-500">
            {published} artigos publicados · {drafts} rascunhos
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d2d4e] transition-colors"
        >
          <Plus size={16} />
          Novo Artigo
        </button>
      </div>

      {/* Busca global */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#6c63ff] focus-within:ring-1 focus-within:ring-[#6c63ff]/20 transition-all">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar artigos, tutoriais, soluções conhecidas..."
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((f) => ({ ...f, search: undefined }))}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Cards de categorias */}
      <div className="grid grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const style = CATEGORY_ICONS[cat];
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilters((f) => ({ ...f, category: isActive ? undefined : cat }))}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-[#6c63ff] bg-purple-50 ring-1 ring-[#6c63ff]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${style.bg}`}>
                <BookOpen size={14} className={style.color} />
              </div>
              <p className="text-xs font-medium text-gray-700 leading-tight">{cat}</p>
              <p className="text-xs text-gray-400 mt-0.5">{countByCategory[cat] ?? 0} artigos</p>
            </button>
          );
        })}
      </div>

      {/* Layout: Sidebar + Artigos */}
      <div className="grid grid-cols-[200px_1fr] gap-5 items-start">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Filtro de status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
            <div className="space-y-1">
              {[
                { value: '',          label: 'Todos',      count: articles.length },
                { value: 'Published', label: 'Publicados', count: published        },
                { value: 'Draft',     label: 'Rascunhos',  count: drafts           },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilters((f) => ({ ...f, status: value || undefined }))}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    (filters.status ?? '') === value
                      ? 'bg-[#1a1a2e] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    (filters.status ?? '') === value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mais acessados */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mais acessados</p>
            <div className="space-y-2">
              {articles
                .filter((a) => a.status === 'Published')
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => openEditor(a)}
                    className="w-full flex items-start gap-2 text-left hover:bg-gray-50 rounded-lg p-1 transition-colors"
                  >
                    <span className="text-xs text-gray-300 font-mono mt-0.5">{i + 1}.</span>
                    <span className="text-xs text-gray-600 leading-snug line-clamp-2">{a.title}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Lista de artigos */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))
          ) : articles.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400">
              <BookOpen size={32} className="mx-auto mb-3 text-gray-200" />
              {filters.search
                ? `Nenhum artigo encontrado para "${filters.search}".`
                : 'Nenhum artigo nesta categoria ainda.'}
            </div>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={openEditor}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal editor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Editar Artigo' : 'Novo Artigo'}
      >
        <ArticleEditor
          article={editingArticle}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}