import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);
export default Client;