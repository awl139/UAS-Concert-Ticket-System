import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'user.exchange',
    routingKey: 'user.created',
    queue: 'order_service_queue',
  })
  async handleUserCreatedEvent(event: any) {
    console.log('📨 Menerima event user.created:', event);
    
    // Simpan log event - tanpa metadata atau dengan type yang jelas
    await this.orderModel.create({
      userId: event.data.userId,
      concertId: 'SYSTEM',
      concertName: 'User Registration Event',
      quantity: 1,
      totalPrice: 0,
      status: 'PAID',
      orderDate: new Date(),
      description: `User baru terdaftar: ${event.data.email}`,
    });
  }

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    // Simulasi data konser
    const concerts = [
      { id: '1', name: 'Coldplay World Tour', price: 750000, stock: 100 },
      { id: '2', name: 'Taylor Swift Eras Tour', price: 1200000, stock: 50 },
      { id: '3', name: 'Blackpink Born Pink', price: 1500000, stock: 30 },
    ];

    const concert = concerts.find(c => c.id === createOrderDto.concertId);
    
    if (!concert) {
      throw new Error('Konser tidak ditemukan');
    }

    if (createOrderDto.quantity > concert.stock) {
      throw new Error('Stok tiket tidak mencukupi');
    }

    // Buat order
    const order = await this.orderModel.create({
      userId,
      concertId: createOrderDto.concertId,
      concertName: concert.name,
      quantity: createOrderDto.quantity,
      totalPrice: concert.price * createOrderDto.quantity,
      status: 'PENDING',
      orderDate: new Date(),
    });

    // Kirim event order.created
    await this.amqpConnection.publish('order.exchange', 'order.created', {
      event: 'order.created',
      data: {
        orderId: order._id.toString(),
        userId,
        concertName: concert.name,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        createdAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Pemesanan berhasil',
      data: order,
    };
  }

  async getUserOrders(userId: string) {
    return this.orderModel.find({ userId }).sort({ orderDate: -1 });
  }

  async getOrderById(id: string) {
    return this.orderModel.findById(id);
  }
}