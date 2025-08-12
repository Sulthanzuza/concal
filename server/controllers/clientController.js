import Client from '../models/Client.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name } = req.body;

    const client = new Client({
      name
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error creating client' });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const client = await Client.findOneAndUpdate(
      { _id: id },
      { name },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error updating client' });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOneAndDelete({ _id: id });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error deleting client' });
  }
};