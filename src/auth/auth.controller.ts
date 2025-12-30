import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller()
export class AuthController {
  @Get('auth')
  checkStatus() {
    return { message: 'OK' }
  }
  @Post('register')
  register(@Body() body: any){
    console.log('Received from Frontend: ', body);
    return {
      status: 'Success',
      receivedData: body
    }
  }
}
