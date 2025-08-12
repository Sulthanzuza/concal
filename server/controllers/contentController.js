import Content from '../models/Content.js';

export const getContent = async (req, res) => {
  try {
    const { client } = req.query;
    
    let filter = {};
    if (client && client !== 'all') {
      filter.client = client;
    }

    const content = await Content.find(filter)
      .populate('client', 'name')
      .sort({ publishAt: 1 });

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
};

export const createContent = async (req, res) => {
  try {
    const {
      client,
      contentType,
      caption,
      mediaUrl,
      publishAt,
      reminderEmails
    } = req.body;

    const content = new Content({
      client,
      contentType,
      caption,
      mediaUrl,
      publishAt: new Date(publishAt),
      reminderEmails: reminderEmails || []
    });

    await content.save();
    await content.populate('client', 'name');
    
    res.status(201).json(content);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error creating content' });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    
    if (updateData.publishAt) {
      updateData.publishAt = new Date(updateData.publishAt);
      if (isNaN(updateData.publishAt)) {
        return res.status(400).json({ message: 'Invalid date for publishAt.' });
      }
    }

    const content = await Content.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error updating content' });
  }
};


export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findOneAndDelete({ _id: id });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error deleting content' });
  }
};