import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CreateTraceDto {
  @IsEnum(['reasoning', 'tool_call', 'output', 'error'])
  type: 'reasoning' | 'tool_call' | 'output' | 'error';

  @IsObject()
  content: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  token_count?: number;
}
