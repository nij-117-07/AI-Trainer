// src/features/identity/components/identity-field.tsx

/**
 * A reusable sub-component for displaying labeled identity data.
 */
export function IdentityField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800 break-all">
        {value}
      </span>
    </div>
  );
}