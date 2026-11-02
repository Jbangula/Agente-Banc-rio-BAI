import React from 'react';

interface BaiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  className?: string;
}

export const BaiLogo: React.FC<BaiLogoProps> = ({
  size = 'md',
  showSubtext = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-18',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblema Oficial BAI */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={`${sizeClasses[size]} w-auto aspect-square drop-shadow-sm`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fundo Azul Marinho BAI */}
          <rect width="100" height="100" rx="22" fill="#002244" />
          
          {/* Losangos e Ondas Geométricas Azul Bebé BAI */}
          <path
            d="M50 14L84 48L50 82L16 48L50 14Z"
            fill="#00A3E0"
            fillOpacity="0.95"
          />
          <path
            d="M50 26L74 50L50 74L26 50L50 26Z"
            fill="#FFFFFF"
          />
          <path
            d="M50 36L64 50L50 64L36 50L50 36Z"
            fill="#002244"
          />
          
          {/* Detalhe Dourado de Autorização Oficial */}
          <circle cx="50" cy="50" r="4.5" fill="#E5A823" />
        </svg>

        {/* Badge "AGENTE" flutuante */}
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-white shadow-xs tracking-wider uppercase">
          AGENTE
        </span>
      </div>

      {/* Tipografia Corporativa BAI */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-2xl font-black tracking-tight text-[#002244]">
            BAI
          </span>
          <span className="text-sm font-extrabold uppercase tracking-widest text-[#00A3E0]">
            Agente
          </span>
        </div>
        {showSubtext && (
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            Rede Bancária Autorizada
          </span>
        )}
      </div>
    </div>
  );
};
