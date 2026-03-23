import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboard(@Request() req) {
    return {
      message: 'Dashboard data',
      user: req.user,
    };
  }
}
