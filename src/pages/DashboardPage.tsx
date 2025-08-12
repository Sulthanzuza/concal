import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar } from 'lucide-react';
import logo from '/full logo in black.svg'
import StatsDashboard from '../components/StatsDashboard';
import CalendarView from '../components/CalendarView';
import ContentModal from '../components/ContentModal';
import ClientManager from '../components/ClientManager';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import api from '../api/api';
import toast from 'react-hot-toast';

// --- Type Definitions ---
interface Client {
  _id: string;
  name: string;
  // Extend as needed (e.g., email, avatar)
}

interface ContentItem {
  _id: string;
  title: string;
  status: 'Pending' | 'Posted' | 'Not Posted';
  client: string | Client;
  date: string;
  [key: string]: any;
}

// --- Main Component ---
const DashboardPage: React.FC = () => {
  // --- State ---
  const [clients, setClients] = useState<Client[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  

  // --- Effects ---
  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, [selectedClient]);

  useEffect(() => {
    if (selectedClient === 'all') {
      setFilteredContent(content);
    } else {
      setFilteredContent(
        content.filter(
          item =>
            (typeof item.client === 'string' ? item.client : (item.client as Client)._id) ===
            selectedClient
        )
      );
    }
  }, [content, selectedClient]);

  // Add this function:
const handleEventMove = async ({ id, newDate }: { id: string; newDate: string }) => {
  try {
    const response = await api.put(`/content/${id}`, { publishAt: newDate });
    // Update state so the UI updates immediately.
    setContent(prev => prev.map(item =>
      item._id === id ? { ...item, publishAt: newDate } : item
    ));
    toast.success('Reminder rescheduled!');
  } catch (error) {
    toast.error('Failed to update date. Change reverted.');
    // CalendarView will handle reverting if passed the info
  }
};

  // --- API Calls ---
  const fetchClients = async () => {
    try {
      const response = await api.get<Client[]>('/clients');
      setClients(response.data);
    } catch {
      toast.error('Failed to fetch clients.');
    }
  };

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ContentItem[]>(
        selectedClient !== 'all' ? `/content?client=${selectedClient}` : '/content'
      );
      setContent(response.data);
    } catch {
      toast.error('Failed to fetch content.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Client Operations ---
  const handleCreateClient = async (name: string) => {
    try {
      const response = await api.post<Client>('/clients', { name });
      setClients([{ ...response.data }, ...clients]);
      toast.success('Client created!');
    } catch {
      toast.error('Failed to create client.');
    }
  };

  const handleUpdateClient = async (id: string, name: string) => {
    try {
      const response = await api.put<Client>(`/clients/${id}`, { name });
      setClients(
        clients.map(client => (client._id === id ? response.data : client))
      );
      toast.success('Client updated!');
    } catch {
      toast.error('Failed to update client.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(client => client._id !== id));
      if (selectedClient === id) setSelectedClient('all');
      toast.success('Client deleted!');
    } catch {
      toast.error('Failed to delete client.');
    }
  };

  // --- Content Operations ---
  const handleSaveContent = async (contentData: any) => {
    try {
      if (editingContent) {
        const response = await api.put<ContentItem>(
          `/content/${editingContent._id}`,
          contentData
        );
        setContent(
          content.map(item =>
            item._id === editingContent._id ? response.data : item
          )
        );
        toast.success('Content updated!');
      } else {
        const response = await api.post<ContentItem>('/content', contentData);
        setContent([response.data, ...content]);
        toast.success('Content created!');
      }
      setEditingContent(null);
      setSelectedDate('');
      setIsContentModalOpen(false);
    } catch {
      toast.error('Failed to save content.');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await api.delete(`/content/${id}`);
        setContent(content.filter(item => item._id !== id));
        toast.success('Content deleted!');
      } catch {
        toast.error('Failed to delete content.');
      }
    }
  };

  // --- Calendar/Event Handlers ---
  const handleEventClick = (contentItem: ContentItem) => {
    setEditingContent(contentItem);
    setIsContentModalOpen(true);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingContent(null);
    setIsContentModalOpen(true);
  };

  const handleNewContent = () => {
    setEditingContent(null);
    setSelectedDate('');
    setIsContentModalOpen(true);
  };

  // --- Stats ---
  const totalClients = clients.length;
  const totalPosts = filteredContent.length;
  const pendingPosts = filteredContent.filter(item => item.status === 'Pending')
    .length;
  const postedPosts = filteredContent.filter(item => item.status === 'Posted')
    .length;
  const notPostedPosts = filteredContent.filter(
    item => item.status === 'Not Posted'
  ).length;

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    ...clients.map(client => ({
      value: client._id,
      label: client.name
    }))
  ];

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src={logo}  className='h-14 w-16 mix-blend-multiply' alt="" />
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                CONCAL
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsClientManagerOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Users className="h-5 w-5 text-blue-600" />
                Clients
              </Button>

              <Button onClick={handleNewContent} size="sm" className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-5 w-5" />
                Add Content
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Select
              value={selectedClient}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedClient(e.target.value)
              }
              options={clientOptions}
              className="w-64"
              aria-label="Filter by Client"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <StatsDashboard
            totalClients={totalClients}
            totalPosts={totalPosts}
            pendingPosts={pendingPosts}
            postedPosts={postedPosts}
            notPostedPosts={notPostedPosts}
          />
        </section>

        {/* Calendar */}
        <section>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading your content and schedule...</p>
            </div>
          ) : (
            <CalendarView
              content={filteredContent}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventMove={handleEventMove} 
            />
          )}
        </section>
      </main>

      {/* Modals */}
      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSave={handleSaveContent}
        clients={clients}
        editingContent={editingContent}
        selectedDate={selectedDate}
        onDeleteContent={handleDeleteContent}
      />

      <ClientManager
        isOpen={isClientManagerOpen}
        onClose={() => setIsClientManagerOpen(false)}
        clients={clients}
        onCreateClient={handleCreateClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
      />
    </div>
  );
};

export default DashboardPage;
