import { type ReactNode, useState } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onDelete?: () => void;
  saving?: boolean;
}

export function AdminModal({ open, onClose, title, children, onSave, onDelete, saving }: AdminModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl my-8 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {(onSave || onDelete) && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-100 dark:border-slate-700">
            <div>
              {onDelete && !confirmDelete && (
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} /> Delete
                </Button>
              )}
              {onDelete && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-error-500">Are you sure?</span>
                  <Button variant="danger" size="sm" onClick={() => { onDelete(); setConfirmDelete(false); }}>
                    Yes, delete
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              {onSave && (
                <Button onClick={onSave} loading={saving}>
                  {!saving && <Save size={16} />} Save
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
