import { Schema, model, Document, Model } from 'mongoose';


export interface IDataEntry {
  date: Date;
  dataType: 'Analysis' | 'Experiment' | 'Simulation';
  value: number;
  description: string; 
} 


const DataEntrySchema: Schema<IDataEntry> = new Schema<IDataEntry>({
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  dataType: { 
    type: String,
    required: true,
    enum: ['Analysis', 'Experiment', 'Simulation']
  },
  value: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: false, 
    default: '' 
  },
});


export const DataEntry: Model<IDataEntry> = model<IDataEntry>('DataEntry', DataEntrySchema);
