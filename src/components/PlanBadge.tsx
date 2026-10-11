import React from 'react';
import { PatientPlan } from '../types';

interface PlanBadgeProps {
  plan: PatientPlan | string;
  partnerId?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({
  plan,
  partnerId,
  size = 'md',
  showDetails = false
}) => {
  const isGympass = plan === 'Gympass';
  const isTotalPass = plan === 'TotalPass';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-xs sm:text-sm px-3 py-1 font-bold'
  }[size];

  if (isGympass) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs ${sizeClasses}`}
        title={`Convênio corporativo: Gympass / Wellhub${partnerId ? ` (ID: ${partnerId})` : ''}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span>Gympass</span>
        {showDetails && partnerId && (
          <span className="text-[10px] font-mono opacity-80 border-l border-rose-200 pl-1 ml-0.5">
            {partnerId}
          </span>
        )}
      </span>
    );
  }

  if (isTotalPass) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs ${sizeClasses}`}
        title={`Convênio corporativo: TotalPass${partnerId ? ` (ID: ${partnerId})` : ''}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
        <span>TotalPass</span>
        {showDetails && partnerId && (
          <span className="text-[10px] font-mono opacity-80 border-l border-sky-200 pl-1 ml-0.5">
            {partnerId}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 ${sizeClasses}`}
    >
      <span>{plan}</span>
    </span>
  );
};
