import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Bold, Italic, Link, Code, List, ListOrdered, Minus } from 'lucide-react';
import { useCreateArticle, useUpdateArticle } from '../../hooks/useKnowledge';
import type { Article } from '../../types';

const schema = z.object({
  title:    z.string().min(5,  'Título deve ter ao menos 5 caracteres'),
  excerpt:  z.string().min(10, 'Resumo deve ter ao menos 10 caracteres'),
  content:  z.string().min(50, 'Conteúdo deve ter ao menos 50 caracteres'),
  status:   z.enum(['Published', 'Draft', 'Archived']),
  category: z.string().min(1, 'Selecione uma categoria'),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Infraestrutura', 'Software', 'Hardware', 'Acesso & Senhas', 'Outros'];

// Botões da toolbar do editor
const TOOLBAR_ACTIONS = [
  { icon: <Bold size={13} />,         label: 'Negrito',      wrap: ['**', '**']   },
  { icon: <Italic size={13} />,       label: 'Itálico',      wrap: ['_', '_']     },
  { icon: <Code size={13} />,         label: 'Código inline',wrap: ['`', '`']     },
  { icon: <Link size={13} />,         label: 'Link',         wrap: ['[', '](url)']},
  { icon: <List size={13} />,         label: 'Lista',        prefix: '- '         },
  { icon: <ListOrdered size={13} />,  label: 'Lista num.',   prefix: '1. '        },
  { icon: <Minus size={13} />,        label: 'Separador',    insert: '\n---\n'    },
];

interface Props {
  article?: Article;
  onSuccess: () => void;
}

export default function ArticleEditor({ article, onSuccess }: Props) {
  const isEditing = !!article;
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const { mutate: create, isPending: isCreating } = useCreateArticle();
  const { mutate: update, isPending: isUpdating  } = useUpdateArticle();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          title:    article.title,
          excerpt:  article.excerpt,
          content:  article.content,
          status:   article.status,
          category: article.category,
        }
      : { status: 'Draft' },
  });

  useEffect(() => {
    if (article) {
      reset({
        title:    article.title,
        excerpt:  article.excerpt,
        content:  article.content,
        status:   article.status,
        category: article.category,
      });
      setTags(article.tags ?? []);
    }
  }, [article, reset]);

  // Aplica formatação Markdown no textarea
  const applyFormat = (action: typeof TOOLBAR_ACTIONS[0]) => {
    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start  = textarea.selectionStart;
    const end    = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const sel    = textarea.value.slice(start, end);
    const after  = textarea.value.slice(end);

    let newText = textarea.value;

    if (action.wrap) {
      newText = `${before}${action.wrap[0]}${sel || 'texto'}${action.wrap[1]}${after}`;
    } else if (action.prefix) {
      newText = `${before}${action.prefix}${sel || 'item'}${after}`;
    } else if (action.insert) {
      newText = `${before}${action.insert}${after}`;
    }

    setValue('content', newText);
    setTimeout(() => textarea.focus(), 0);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const onSubmit = (data: FormData) => {
    const payload = { ...data, tags };
    if (isEditing) {
      update({ id: article.id, payload }, { onSuccess });
    } else {
      create(payload, { onSuccess });
    }
  };

  // Salva rascunho direto
  const saveDraft = () => {
    const values = getValues();
    const payload = { ...values, status: 'Draft' as const, tags };
    if (isEditing) {
      update({ id: article.id, payload }, { onSuccess });
    } else {
      create({ ...payload, status: 'Draft' }, { onSuccess });
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20 transition-all";

  return (
    <div className="grid grid-cols-[1fr_220px] gap-5">
      {/* Editor principal */}
      <div className="space-y-4">
        {/* Título */}
        <div>
          <input
            {...register('title')}
            placeholder="Título do artigo..."
            className="w-full text-lg font-semibold border-0 border-b border-gray-200 pb-2 outline-none focus:border-[#6c63ff] transition-colors placeholder-gray-300 bg-transparent"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Resumo (aparece na listagem)</label>
          <input
            {...register('excerpt')}
            placeholder="Uma frase descrevendo o artigo..."
            className={inputClass}
          />
          {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt.message}</p>}
        </div>

        {/* Toolbar + Editor */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Conteúdo (Markdown)</label>

          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 border-b-0 rounded-t-lg flex-wrap">
            {TOOLBAR_ACTIONS.map((action, i) => (
              <button
                key={i}
                type="button"
                title={action.label}
                onClick={() => applyFormat(action)}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
              >
                {action.icon}
              </button>
            ))}
            <div className="ml-auto text-xs text-gray-400 pr-1">Markdown</div>
          </div>

          <textarea
            id="article-content"
            {...register('content')}
            rows={12}
            placeholder="Escreva o conteúdo do artigo em Markdown...&#10;&#10;## Título da seção&#10;&#10;Texto do artigo aqui..."
            className="w-full border border-gray-200 rounded-b-lg rounded-t-none px-4 py-3 text-sm font-mono outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20 resize-none transition-all"
          />
          {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
        </div>
      </div>

      {/* Sidebar do editor */}
      <div className="space-y-4">
        {/* Status + Categoria */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select {...register('status')} className={inputClass}>
              <option value="Draft">Rascunho</option>
              <option value="Published">Publicado</option>
              <option value="Archived">Arquivado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
            <select {...register('category')} className={inputClass}>
              <option value="">Selecione...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Nova tag..."
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#6c63ff]"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-2 py-1.5 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full bg-[#1a1a2e] text-white text-sm py-2.5 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Salvando...' : 'Publicar artigo'}
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={isPending}
            className="w-full border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Salvar rascunho
          </button>
        </div>

        {/* Stats (apenas em edição) */}
        {isEditing && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Estatísticas</p>
            <div className="space-y-2">
              {[
                { label: 'Visualizações',     value: article.views },
                { label: 'Avaliações úteis',  value: `${article.helpfulPercent}%` },
                { label: 'Chamados vinculados',value: article.linkedTickets },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs border-b border-gray-200 pb-1.5 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}