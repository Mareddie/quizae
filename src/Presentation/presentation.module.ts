import { Module } from '@nestjs/common';
import { SecurityModule } from './Security/security.module';

@Module({
  imports: [SecurityModule],
})
export class PresentationModule {}
