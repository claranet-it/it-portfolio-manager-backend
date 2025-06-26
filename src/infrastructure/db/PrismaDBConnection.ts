import { PrismaClient } from '../../../prisma/generated'


export class PrismaDBConnection {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  getClient(): PrismaClient {
    return this.prisma;
  }
}