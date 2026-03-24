import { Injectable, ConflictException, UnauthorizedException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity';
import { SignupDto, LoginDto } from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private jwtService: JwtService
  ){}
  async signup(dto: SignupDto){
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: dto.username },
        { email: dto.email }
      ]
    });
    if(existingUser){
      const field = existingUser.username === dto.username ? 'Username' : 'Email';
      throw new ConflictException(`${field} field is already registered`);
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return { message: 'User Created Successfully' };
  }

  async login(dto: LoginDto){
    let user = await this.userRepository.findOne({
      where: { username: dto.username }
    });

    if(!user){
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch){
      throw new UnauthorizedException('Invalid Credentials');
    } else {
      const { password, ...result} = user;
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
        message: 'Login Successfully',
        user: result
      }
    }
  }
}