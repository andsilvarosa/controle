
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-slate-200/80";
  const variants = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-md h-4"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-24">
      {/* Wallets & Score */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
           <Skeleton className="w-48 h-6 mb-4" variant="text" />
           <div className="flex gap-4 overflow-hidden">
             <Skeleton className="w-64 h-32 flex-shrink-0" />
             <Skeleton className="w-64 h-32 flex-shrink-0" />
             <Skeleton className="w-64 h-32 flex-shrink-0" />
           </div>
        </div>
        <div className="xl:col-span-1">
           <Skeleton className="h-full min-h-[160px] w-full" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      {/* Filters */}
      <Skeleton className="h-16 w-full" />

      {/* List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
           <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12" variant="circle" />
              <div className="flex-1 space-y-2">
                 <Skeleton className="w-3/4 h-4" variant="text" />
                 <Skeleton className="w-1/2 h-3" variant="text" />
              </div>
              <Skeleton className="w-24 h-8" />
           </div>
        ))}
      </div>
    </div>
  );
};
