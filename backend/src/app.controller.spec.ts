import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DRIZZLE } from './database/index.js';

const mockDb = {
  execute: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return connected when db is reachable', async () => {
      const result = await appController.getHealth();
      expect(result).toEqual({ status: '200 OK', database: 'connected' });
    });

    it('should return disconnected when db fails', async () => {
      mockDb.execute.mockRejectedValueOnce(new Error('connection refused'));
      const result = await appController.getHealth();
      expect(result).toEqual({ status: '200 OK', database: 'disconnected' });
    });
  });
});
