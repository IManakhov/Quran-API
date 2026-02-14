import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class MysqlService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const host = process.env.DB_HOST ?? '127.0.0.1';
    const port = Number(process.env.DB_PORT ?? 3306);
    const user = process.env.DB_USER ?? 'root';
    const password = process.env.DB_PASSWORD ?? '';
    const database = process.env.DB_NAME ?? 'quran_api';

    this.pool = createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10,
    });
  }

  getPool(): Pool {
    return this.pool;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

