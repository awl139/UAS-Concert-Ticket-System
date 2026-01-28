import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as bcrypt from 'bcryptjs';  // GANTI INI
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async register(registerDto: RegisterDto) {
    // Cek jika user sudah ada
    const existingUser = await this.userModel.findOne({ 
      email: registerDto.email 
    });
    
    if (existingUser) {
      throw new UnauthorizedException('Email sudah terdaftar');
    }

    // Hash password dengan bcryptjs
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Kirim event ke RabbitMQ
    await this.amqpConnection.publish('user.exchange', 'user.created', {
      event: 'user.created',
      data: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: new Date(),
      },
    });

    // Generate token
    const token = this.jwtService.sign({ 
      userId: user._id, 
      email: user.email 
    });

    return {
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verify password dengan bcryptjs
    const isPasswordValid = await bcrypt.compare(
      loginDto.password, 
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = this.jwtService.sign({ 
      userId: user._id, 
      email: user.email 
    });

    return {
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    };
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId);
  }
}