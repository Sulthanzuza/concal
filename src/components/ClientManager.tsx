import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

interface Client {
  _id: string;
  name: string;
}

interface ClientManagerProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onCreateClient: (name: string) => Promise<void>;
  onUpdateClient: (id: string, name: string) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

const ClientManager: React.FC<ClientManagerProps> = ({
  isOpen,
  onClose,
  clients,
  onCreateClient,
  onUpdateClient,
  onDeleteClient
}) => {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await onUpdateClient(editingClient._id, clientName.trim());
        setEditingClient(null);
      } else {
        await onCreateClient(clientName.trim());
        setShowCreateForm(false);
      }
      setClientName('');
    } catch (error) {
      // Error already handled above
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setClientName(client.name);
    setShowCreateForm(false);
  };
  const startCreate = () => {
    setShowCreateForm(true);
    setEditingClient(null);
    setClientName('');
  };
  const cancelEdit = () => {
    setEditingClient(null);
    setShowCreateForm(false);
    setClientName('');
  };

  const handleDelete = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      await onDeleteClient(clientId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Clients" size="md">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900">Your Clients</h4>
          <Button onClick={startCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
        {(showCreateForm || editingClient) && (
          <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
            <Input
              label={editingClient ? 'Edit Client Name' : 'New Client Name'}
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Enter client name"
              required
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !clientName.trim()}
              >
                {isSubmitting ? 'Saving...' : editingClient ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {clients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No clients yet. Create your first client to get started!
            </p>
          ) : (
            clients.map(client => (
              <div
                key={client._id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <span className="font-medium text-gray-900">{client.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(client)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit client"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClientManager;
