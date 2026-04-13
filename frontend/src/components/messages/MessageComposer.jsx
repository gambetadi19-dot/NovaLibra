import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../hooks/useToast';

export default function MessageComposer({
  onSubmit,
  receiverId,
  recipientLabel = 'platform team',
  recipients = [],
  onRecipientChange,
  recipientHint = 'Choose who should receive this message.'
}) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const hasRecipientPicker = recipients.length > 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!receiverId) {
      setError('Message recipient is not ready yet.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter a message before sending.');
      return;
    }

    if (content.trim().length < 10) {
      setError('Please add a little more detail so the recipient has context.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({ receiverId, subject: subject.trim(), content: content.trim() });
      setSubject('');
      setContent('');
      toast.success('Message sent.', `Your note has been delivered to ${recipientLabel}.`);
    } catch (submitError) {
      const message = submitError?.response?.data?.message || 'Unable to send your message right now.';
      setError(message);
      toast.error('Message failed to send.', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section-card space-y-5">
      <div className="rounded-[22px] border border-brand-gold/15 bg-brand-gold/10 px-4 py-3 text-sm text-brand-sand">
        Sending to <span className="font-semibold text-white">{recipientLabel}</span>.
      </div>
      {hasRecipientPicker ? (
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Recipient</span>
          <select
            value={receiverId || ''}
            onChange={(event) => {
              onRecipientChange?.(Number(event.target.value) || null);
              if (error) {
                setError('');
              }
            }}
            className="w-full rounded-[22px] border border-white/10 bg-brand-900/80 px-4 py-3.5 text-sm text-white shadow-inner shadow-black/20 transition focus:border-brand-gold focus:bg-brand-900"
          >
            <option value="">Choose a recipient</option>
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name} ({recipient.role === 'AUTHOR' ? 'Author' : 'Platform team'})
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500">{recipientHint}</p>
        </label>
      ) : null}
      <Input
        label="Subject"
        placeholder="Book feedback, partnership idea, rights inquiry..."
        value={subject}
        hint="Optional, but helpful for faster replies."
        onChange={(event) => {
          setSubject(event.target.value);
        }}
      />
      <Input
        label="Message"
        textarea
        rows={5}
        placeholder="Write your message..."
        value={content}
        required
        error={error}
        hint={`${content.trim().length}/1000 characters`}
        maxLength={1000}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) {
            setError('');
          }
        }}
      />
      <Button type="submit" disabled={submitting || !receiverId} size="lg">
        {submitting ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
