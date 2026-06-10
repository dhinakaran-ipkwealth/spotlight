import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty({ message: 'customerName is required' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'business is required' })
  business: string;

  @IsString()
  @IsNotEmpty({ message: 'mobile is required' })
  mobile: string;

  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @Type(() => Number)
  @IsInt({ message: 'rating must be an integer between 1 and 5' })
  @Min(1, { message: 'rating must be between 1 and 5' })
  @Max(5, { message: 'rating must be between 1 and 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'feedbackText must not be empty' })
  feedbackText: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'sourceUrl must be a valid URL' })
  sourceUrl?: string;
}
