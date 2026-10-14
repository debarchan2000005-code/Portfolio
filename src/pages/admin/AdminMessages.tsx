import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AdminModal } from '@/components/admin/AdminModal';
import { Mail, CheckCheck, Inbox } from 'lucide-react';

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } else {
      setMessages(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin-contact-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openMessage = async (msg: Message) => {
    setSelected(msg);

    if (!msg.read) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', msg.id);

      if (error) {
        console.error('Failed to mark message as read:', error);
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === msg.id ? { ...item, read: true } : item
        )
      );
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    const id = selected.id;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete message:', error);
      alert(`Could not delete message: ${error.message}`);
      return;
    }

    setMessages((current) => current.filter((item) => item.id !== id));
    setSelected(null);
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Failed to mark all messages as read:', error);
      alert(`Could not mark messages as read: ${error.message}`);
      return;
    }

    setMessages((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread of ${messages.length} total`
              : `${messages.length} total messages`}
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading...</p>
      ) : messages.length === 0 ? (
        <Card className="text-center py-12">
          <Inbox size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400">No messages yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className="cursor-pointer hover:border-primary-200 dark:hover:border-primary-800"
              onClick={() => openMessage(msg)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    msg.read
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                      : 'bg-primary-500 text-white'
                  }`}
                >
                  {msg.name[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`text-sm ${
                        msg.read
                          ? 'font-medium text-gray-700 dark:text-slate-300'
                          : 'font-bold text-gray-900 dark:text-white'
                      }`}
                    >
                      {msg.name}
                    </p>
                    {!msg.read && <Badge variant="success">New</Badge>}
                  </div>

                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                    {msg.subject || '(no subject)'} — {msg.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>

                <Mail size={18} className="text-gray-300 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Message Details"
        onDelete={handleDelete}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white font-medium">
                {selected.name[0]?.toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selected.name}
                </p>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-primary-500 hover:underline"
                >
                  {selected.email}
                </a>
              </div>

              <span className="ml-auto text-xs text-gray-400">
                {new Date(selected.created_at).toLocaleString()}
              </span>
            </div>

            {selected.subject && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Subject</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selected.subject}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 mb-1">Message</p>
              <p className="text-gray-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selected.message}
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(
                  `Re: ${selected.subject || 'Your message'}`
                )}`}
                className="btn-primary text-sm"
              >
                <Mail size={16} />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
