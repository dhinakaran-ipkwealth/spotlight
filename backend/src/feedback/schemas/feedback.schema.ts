import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, trim: true })
  business: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  feedbackText: string;

  @Prop({ trim: true })
  sourceUrl?: string;

  @Prop({ trim: true })
  ipAddress?: string;

  @Prop({ trim: true })
  userAgent?: string;

  @Prop({ default: () => new Date() })
  submittedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
