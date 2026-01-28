import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  concertId: string;

  @Prop({ required: true })
  concertName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ 
    required: true, 
    enum: ['PENDING', 'PAID', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;

  @Prop({ required: true, default: Date.now })
  orderDate: Date;

  @Prop({ type: String }) // TAMBAHKAN TYPE EXPLICIT
  description?: string;

  @Prop({ type: Object }) // TAMBAHKAN TYPE EXPLICIT UNTUK METADATA
  metadata?: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);