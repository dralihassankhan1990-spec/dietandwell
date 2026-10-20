import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ReplyInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(10000)
  @Matches(/\S/, { message: 'Reply must contain a message' })
  message: string;
}
