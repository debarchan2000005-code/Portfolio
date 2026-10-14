import { type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineLoader } from '@/components/ui/Loading';

interface DataTableProps {
  title: string;
  description?: string;
  loading: boolean;
  onAdd: () => void;
  addLabel: string;
  children: ReactNode;
}

export function AdminPageHeader({ title, description, loading, onAdd, addLabel, children }: DataTableProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} /> {addLabel}
        </Button>
      </div>
      {loading ? <InlineLoader /> : children}
    </div>
  );
}
