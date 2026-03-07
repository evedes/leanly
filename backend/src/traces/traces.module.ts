import { Module } from '@nestjs/common';
import { TracesController } from './traces.controller.js';
import { TracesService } from './traces.service.js';

@Module({
  controllers: [TracesController],
  providers: [TracesService],
  exports: [TracesService],
})
export class TracesModule {}
