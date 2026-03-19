import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}
  
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }
  
  @Post('signup')
  register(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }
}
