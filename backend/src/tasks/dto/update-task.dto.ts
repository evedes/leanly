import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['human', 'agent'])
  assignee_type?: 'human' | 'agent';

  @IsOptional()
  @IsUUID()
  assignee_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  autonomy_level?: number;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'in_review', 'approved', 'rejected'])
  status?: 'todo' | 'in_progress' | 'in_review' | 'approved' | 'rejected';
}
