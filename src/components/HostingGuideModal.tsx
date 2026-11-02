import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Github,
  Globe,
  Layers,
  Server,
  Terminal,
  Zap,
} from 'lucide-react';

interface HostingGuideModalProps {
  onClose: () => void;
}

export const HostingGuideModal: React.FC<HostingGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'github' | 'vercel' | 'firebase' | 'supabase'>('terminal');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#00A3E0] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#002244] uppercase tracking-wide">
                Guia Oficial de Hospedagem & Sincronização em Tempo Real
              </h3>
              <p className="text-xs text-slate-500">
                Como hospedar no GitHub, Vercel ou Firebase para funcionamento online 24/7 sem custos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'terminal'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Onde Fica o Terminal?</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'bg-[#002244] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>1. GitHub Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'vercel'
                ? 'bg-[#00A3E0] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>2. Vercel / Netlify (Mais Fácil)</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'firebase'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>3. Firebase (Tempo Real)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'supabase'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>4. Supabase (Alternativa)</span>
          </button>
        </div>

        {/* CONTEÚDO: COMO ENCONTRAR O TERMINAL NO PC */}
        {activeTab === 'terminal' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <Terminal className="w-4 h-4 text-rose-600" />
                <span>Como abrir o Terminal no seu Computador (Passo a Passo)</span>
              </div>
              <p className="text-[11px] text-rose-900">
                O terminal tem nomes diferentes dependendo do seu sistema operacional (Windows, Mac ou Linux).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Windows */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-extrabold text-[#002244] uppercase tracking-wider block text-[11px]">
                  💻 Se usa Windows (O Mais Comum):
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                  <li>
                    <strong>Opção 1 (Mais rápida):</strong> No teclado, pressione a tecla <strong>Windows</strong> (bandeirinha ⊞) junto com a letra <strong>R</strong> (Windows + R). Aparecerá uma caixinha, digite <code className="bg-white border px-1 py-0.5 rounded font-mono font-bold text-slate-900">cmd</code> ou <code className="bg-white border px-1 py-0.5 rounded font-mono font-bold text-slate-900">powershell</code> e dê <strong>Enter</strong>.
                  </li>
                  <li>
                    <strong>Opção 2:</strong> Clique no menu <strong>Iniciar</strong> (no canto inferior esquerdo) e escreva <strong>Prompt de Comando</strong> ou <strong>PowerShell</strong> ou <strong>Terminal</strong> e clique no ícone preto que surgir.
                  </li>
                  <li>
                    <strong>Opção 3 (No VS Code):</strong> Se abriu a pasta no programa VS Code, pressione as teclas <kbd className="bg-white border px-1 rounded font-mono">Ctrl</kbd> + <kbd className="bg-white border px-1 rounded font-mono">~</kbd> (ou clique no menu superior <em>Terminal &gt; Novo Terminal</em>).
                  </li>
                </ul>
              </div>

              {/* Mac & Linux */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-extrabold text-[#002244] uppercase tracking-wider block text-[11px]">
                  🍏 Se usa Mac ou Linux:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                  <li>
                    <strong>No Mac:</strong> Pressione <kbd className="bg-white border px-1 rounded font-mono">Command ⌘</kbd> + <kbd className="bg-white border px-1 rounded font-mono">Espaço</kbd>, escreva <strong>Terminal</strong> e clique Enter.
                  </li>
                  <li>
                    <strong>No Linux:</strong> Pressione simultaneamente as teclas <kbd className="bg-white border px-1 rounded font-mono">Ctrl</kbd> + <kbd className="bg-white border px-1 rounded font-mono">Alt</kbd> + <kbd className="bg-white border px-1 rounded font-mono">T</kbd>.
                  </li>
                </ul>
              </div>
            </div>

            {/* Dica de Ouro: Como hospedar SEM terminal */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-extrabold text-emerald-900 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Não quer usar o Terminal? Como Hospedar 100% pelo Navegador:</span>
              </span>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Você pode hospedar este site sem digitar nenhum comando! Basta aceder a <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">app.netlify.com/drop</a> e arrastar a pasta compilada <code className="bg-white px-1 py-0.5 rounded font-mono font-bold">dist</code> diretamente para a página. O site ganha um link na hora sem terminal!
              </p>
            </div>
          </div>
        )}

        {/* CONTEÚDO: GITHUB PAGES */}
        {activeTab === 'github' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 leading-relaxed">
              <strong>Hospedagem 100% Gratuita no GitHub:</strong> Você pode hospedar este aplicativo web no GitHub Pages sem pagar nada.
            </div>

            <ol className="space-y-3 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                <strong>Crie um Repositório no GitHub:</strong>
                <p className="text-slate-500 text-[11px] pl-4 mt-0.5">
                  Acesse <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-[#00A3E0] underline font-bold">github.com/new</a> e crie um repositório chamado por exemplo: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">agente-bai-gestao</code>.
                </p>
              </li>

              <li>
                <strong>Envie o código para o GitHub através do terminal:</strong>
                <div className="relative mt-1.5 pl-4">
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`git init
git add .
git commit -m "Lançamento Oficial Agente BAI"
git branch -M main
git remote add origin https://github.com/SEU-UTILIZADOR/agente-bai-gestao.git
git push -u origin main`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Lançamento Oficial Agente BAI"\ngit branch -M main\ngit remote add origin https://github.com/SEU-UTILIZADOR/agente-bai-gestao.git\ngit push -u origin main`, 1)}
                    className="absolute right-3 top-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
              </li>

              <li>
                <strong>Ative o GitHub Pages:</strong>
                <p className="text-slate-500 text-[11px] pl-4 mt-0.5">
                  No repositório do GitHub, vá em <strong>Settings &gt; Pages</strong>. Em "Build and deployment", selecione <strong>GitHub Actions</strong> e escolha a predefinição "Static HTML" ou "Vite". O GitHub fará o build e publicará seu link oficial gratuitamente!
                </p>
              </li>
            </ol>
          </div>
        )}

        {/* CONTEÚDO: VERCEL / NETLIFY */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
              <strong>Método Recomendado (Mais Rápido e Estável):</strong> Vercel e Netlify compilam automaticamente o Vite React com SSL grátis e velocidade ultra rápida para Angola.
            </div>

            <ol className="space-y-3 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#00A3E0] underline font-bold">vercel.com</a> e faça login com a sua conta GitHub.
              </li>
              <li>
                Clique em <strong>"Add New Project"</strong> e selecione o repositório do seu Agente BAI.
              </li>
              <li>
                A Vercel detectará automaticamente as configurações:
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] mt-1 space-y-1">
                  <div>Framework Preset: <strong>Vite</strong></div>
                  <div>Build Command: <strong>npm run build</strong></div>
                  <div>Output Directory: <strong>dist</strong></div>
                </div>
              </li>
              <li>
                Clique em <strong>"Deploy"</strong>. Em menos de 1 minuto, o seu link permanente estará no ar (ex: <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 font-bold">https://agente-bai.vercel.app</code>).
              </li>
            </ol>
          </div>
        )}

        {/* CONTEÚDO: FIREBASE (TEMPO REAL) */}
        {activeTab === 'firebase' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
              <strong>Sincronização em Tempo Real com Google Firebase:</strong> Garante que quando um operador submete um movimento no balcão, o supervisor e o administrador recebem o dado instantaneamente em qualquer computador ou telemóvel.
            </div>

            <ol className="space-y-3 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Acesse <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-700 underline font-bold">console.firebase.google.com</a> com a sua conta Google.
              </li>
              <li>
                Crie um novo projeto chamado <strong>"Agente-BAI-Gestao"</strong>.
              </li>
              <li>
                No menu lateral, clique em <strong>Firestore Database</strong> &gt; <strong>Criar Banco de Dados</strong> (em modo de teste ou produção).
              </li>
              <li>
                Em <strong>Configurações do Projeto</strong> (ícone de engrenagem) &gt; <strong>Geral</strong>, adicione um aplicativo Web e copie as credenciais:
                <div className="relative mt-1.5 pl-4">
                  <pre className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`apiKey: "AIzaSy..."
projectId: "agente-bai-gestao"
authDomain: "agente-bai-gestao.firebaseapp.com"`}
                  </pre>
                </div>
              </li>
              <li>
                No sistema, abra <strong>Definições da Empresa</strong> &gt; cole o seu <strong>API Key</strong> e <strong>Project ID</strong>. A sincronização em nuvem ficará 100% activa em tempo real!
              </li>
            </ol>
          </div>
        )}

        {/* CONTEÚDO: SUPABASE */}
        {activeTab === 'supabase' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
              <strong>Sincronização com Supabase (PostgreSQL em Tempo Real):</strong> Alternativa open-source de alta performance com websockets nativos.
            </div>

            <ol className="space-y-3 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">supabase.com</a> e crie um projeto grátis.
              </li>
              <li>
                No SQL Editor, crie as tabelas de relatórios e movimentos:
                <div className="relative mt-1.5 pl-4">
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`CREATE TABLE daily_reports (
  id TEXT PRIMARY KEY,
  report_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  total_movements INT,
  total_amount_kz NUMERIC,
  physical_value NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`CREATE TABLE daily_reports (\n  id TEXT PRIMARY KEY,\n  report_number TEXT NOT NULL,\n  user_name TEXT NOT NULL,\n  recipient_email TEXT NOT NULL,\n  total_movements INT,\n  total_amount_kz NUMERIC,\n  physical_value NUMERIC,\n  status TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);`, 2)}
                    className="absolute right-3 top-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar SQL</span>
                  </button>
                </div>
              </li>
              <li>
                Ative o recurso <strong>Realtime</strong> nas tabelas para actualização automática instantânea entre todos os utilizadores.
              </li>
            </ol>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Dúvidas operacionais? Contacte a gestão técnica do Agente BAI.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#002244] hover:bg-[#003366] text-white rounded-xl font-bold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
