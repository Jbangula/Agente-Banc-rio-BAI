import React, { useState } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  Copy,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  UserCog,
  Users,
} from 'lucide-react';
import { CompanySettings, User } from '../types';
import { BaiLogo } from './BaiLogo';

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  settings: CompanySettings;
  onSwitchUser: (user: User) => void;
  onOpenSettings: () => void;
  onOpenAccountModal: () => void;
  onOpenHostingGuide: () => void;
  onOpenShareModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  settings,
  onSwitchUser,
  onOpenSettings,
  onOpenAccountModal,
  onOpenHostingGuide,
  onOpenShareModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            ADMINISTRADOR
          </span>
        );
      case 'supervisor':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            SUPERVISOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
            <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
            OPERADOR AGENTE
          </span>
        );
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Barra Superior Institucional BAI */}
      <div className="bg-[#002244] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Building2 className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span className="text-slate-300">Empresa Representante:</span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              {settings.companyName}
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-[#00A3E0] font-mono hidden sm:inline font-semibold">
              {settings.agentNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Criptográfico E2E */}
            <div className="flex items-center gap-1.5 bg-[#00A3E0]/20 text-sky-200 px-2 py-0.5 rounded text-[11px] font-medium border border-sky-400/30">
              <Lock className="w-3 h-3 text-[#00A3E0]" />
              <span className="hidden md:inline">Encriptação E2E Activa</span>
            </div>

            {/* Sincronização em tempo real */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Tempo Real</span>
            </div>

            {/* Botão Guia de Hospedagem */}
            <button
              onClick={onOpenHostingGuide}
              className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded transition font-semibold"
              title="Instruções para Hospedar no GitHub / Firebase / Vercel"
            >
              <Globe2 className="w-3 h-3" />
              <span>Hospedagem & Nuvem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra Principal de Navegação */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Marca Agente BAI */}
        <div className="flex items-center gap-4">
          <BaiLogo size="md" />
        </div>

        {/* Acções de Usuário e Partilha */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Partilhar Link de Acesso */}
          <button
            onClick={onOpenShareModal}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-sky-50 text-[#00A3E0] hover:bg-sky-100 border border-sky-200 transition"
            title="Partilhar link com operadores e supervisores"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partilhar Acesso</span>
          </button>

          {/* Selector Rápido de Utilizador (Simulador de Turnos) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSwitchMenu(!showSwitchMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition text-slate-700"
              title="Trocar operador em turno rapidamente"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Trocar Utilizador</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSwitchMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Alternar Utilizador em Turno
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowSwitchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition ${
                        currentUser?.id === u.id ? 'bg-sky-50/70 font-semibold text-[#00A3E0]' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400 truncate">@{u.username} • {u.role}</div>
                      </div>
                      {currentUser?.id === u.id && (
                        <Check className="w-3.5 h-3.5 text-[#00A3E0] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu do Utilizador Activo */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowSwitchMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200 bg-white"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                style={{ backgroundColor: currentUser?.avatarColor || '#00A3E0' }}
              >
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden lg:block leading-tight">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                  {currentUser?.fullName || 'Utilizador'}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>@{currentUser?.username}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.fullName}
                  </div>
                  <div className="text-xs text-slate-500 truncate mb-2">
                    {currentUser?.email}
                  </div>
                  {currentUser && getRoleBadge(currentUser.role)}
                </div>

                <div className="py-1 text-xs text-slate-700">
                  <button
                    onClick={() => {
                      onOpenAccountModal();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <UserCog className="w-4 h-4 text-slate-500" />
                    <span>Gerir Minha Conta (Nome / Senha)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCopyLink();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copiar Link de Acesso</span>
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-[#002244] font-medium"
                    >
                      <Building2 className="w-4 h-4 text-[#00A3E0]" />
                      <span>Definições do Agente & Empresa</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1 text-xs">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
