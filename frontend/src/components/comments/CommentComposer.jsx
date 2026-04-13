import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../../hooks/useToast';

export default function CommentComposer({
  label = 'Add a comment',
  onSubmit,
  placeholder = 'Share your thoughts...',
  initialValue = '',
  submitLabel = 'Post',
  cancelLabel,
  onCancel
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setContent(initialValue);
    setError('');
  }, [initialValue]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) {
      setError('Please enter a message before submitting.');
      return;
    }

    if (content.trim().length < 3) {
      setError('Please write at least 3 characters so the comment has enough context.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
      toast.success(
        submitLabel === 'Reply' ? 'Reply posted.' : submitLabel === 'Save changes' ? 'Comment updated.' : 'Comment posted.',
        'Your contribution is now visible in the conversation.'
      );
    } catch (submitError) {
      const message = submitError?.response?.data?.message || 'Unable to submit right now.';
      setError(message);
      toast.error('Comment action failed.', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-400">
        Thoughtful comments help discussions feel worth returning to. Ask a question, react to a passage, or build on another reader's insight.
      </div>
      <Input
        label={label}
        textarea
        rows={4}
        placeholder={placeholder}
        value={content}
        required
        hint={`${content.trim().length}/500 characters`}
        error={error}
        maxLength={500}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) {
            setError('');
          }
        }}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
        <p className="self-center text-xs uppercase tracking-[0.22em] text-slate-500">Best when specific and kind</p>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel || 'Cancel'}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
