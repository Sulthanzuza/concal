import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { X } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
}

interface Content {
  _id?: string;
  client: string | { _id: string; name: string };
  contentType: string;
  caption: string;
  mediaUrl: string;
  publishAt: string;
  reminderEmails: string[];
  status?: string;
}

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: Content) => Promise<void>;
  onDeleteContent?: (id: string) => Promise<void>;
  clients: Client[];
  editingContent?: Content | null;
  selectedDate?: string;
}

const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteContent,
  clients,
  editingContent,
  selectedDate
}) => {
  const [formData, setFormData] = useState<Content>({
    client: '',
    contentType: 'Post',
    caption: '',
    mediaUrl: '',
    publishAt: '',
    reminderEmails: []
  });

  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContent) {
      const clientId =
        typeof editingContent.client === 'string'
          ? editingContent.client
          : editingContent.client._id;
      setFormData({
        ...editingContent,
        client: clientId,
        publishAt: format(new Date(editingContent.publishAt), "yyyy-MM-dd'T'HH:mm")
      });
    } else if (selectedDate) {
      const defaultTime = new Date();
      defaultTime.setHours(9, 0, 0, 0);
      const dateTime = `${selectedDate}T${format(defaultTime, 'HH:mm')}`;
      setFormData({
        client: '',
        contentType: 'Post',
        caption: '',
        mediaUrl: '',
        publishAt: dateTime,
        reminderEmails: []
      });
    } else {
      const now = new Date();
      setFormData({
        client: '',
        contentType: 'Post',
        caption: '',
        mediaUrl: '',
        publishAt: format(now, "yyyy-MM-dd'T'HH:mm"),
        reminderEmails: []
      });
    }
  }, [editingContent, selectedDate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addEmail = () => {
    if (
      emailInput.trim() &&
      !formData.reminderEmails.includes(emailInput.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        reminderEmails: [...prev.reminderEmails, emailInput.trim()]
      }));
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      reminderEmails: prev.reminderEmails.filter(e => e !== email)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.client ||
      !formData.caption ||
      !formData.mediaUrl ||
      !formData.publishAt
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
      setEmailInput('');
    } catch (error) {
      // Error already handled above
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      editingContent &&
      onDeleteContent &&
      editingContent._id &&
      window.confirm("Are you sure you want to delete this content? This action cannot be undone.")
    ) {
      setIsSubmitting(true);
      await onDeleteContent(editingContent._id);
      setIsSubmitting(false);
      onClose();
    }
  };

  const contentTypeOptions = [
    { value: 'Post', label: 'Post' },
    { value: 'Reel', label: 'Reel' },
    { value: 'Story', label: 'Story' }
  ];

  const clientOptions = [
    { value: '', label: 'Select a client' },
    ...clients.map(client => ({
      value: client._id,
      label: client.name
    }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingContent ? 'Edit Content' : 'Create New Content'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Client *"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            options={clientOptions}
            required
          />
          <Select
            label="Content Type *"
            name="contentType"
            value={formData.contentType}
            onChange={handleInputChange}
            options={contentTypeOptions}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption *
          </label>
          <textarea
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your content caption..."
          />
        </div>
        <Input
          label="Media URL *"
          name="mediaUrl"
          type="url"
          value={formData.mediaUrl}
          onChange={handleInputChange}
          required
          placeholder="https://example.com/image.jpg"
        />
        <Input
          label="Publish Date & Time *"
          name="publishAt"
          type="datetime-local"
          value={formData.publishAt}
          onChange={handleInputChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Emails
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter email address"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            <Button
              type="button"
              onClick={addEmail}
              variant="outline"
              disabled={!emailInput.trim()}
            >
              Add
            </Button>
          </div>
          {formData.reminderEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.reminderEmails.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        {editingContent && (
          <Select
            label="Status"
            name="status"
            value={formData.status || 'Pending'}
            onChange={handleInputChange}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Posted', label: 'Posted' },
              { value: 'Not Posted', label: 'Not Posted' }
            ]}
          />
        )}
        <div className="flex justify-between items-center pt-6 border-t gap-3">
          {editingContent && onDeleteContent && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
               className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Content
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingContent
                ? 'Update'
                : 'Create'}{' '}
              Content
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ContentModal;
