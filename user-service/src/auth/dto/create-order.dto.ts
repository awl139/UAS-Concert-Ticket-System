import { 
  IsString, 
  IsNumber, 
  Min, 
  IsNotEmpty, 
  IsMongoId 
} from 'class-validator';

export class CreateOrderDto {
  @IsMongoId({ message: 'ID konser tidak valid' })
  concertId: string;

  @IsNumber()
  @Min(1, { message: 'Minimal pembelian 1 tiket' })
  quantity: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}