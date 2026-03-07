import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { AppService } from './app.service';
import { DRIZZLE, type DrizzleDB } from './database/index.js';
import { Public } from './auth/index.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async getHealth() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: '200 OK', database: 'connected' };
    } catch {
      return { status: '200 OK', database: 'disconnected' };
    }
  }
}
