import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response.interface';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name)  private userModel: Model<User>,
    private jwtService: JwtService  
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      //Encriptar contraseña
      const { password, ...userData } = createUserDto;
      
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ) ,
        ...userData
      });

 
      //Guardar usuario
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;
        

    } catch (error) {

      //Manejo de errores

      if(error.code === 11000) {
        throw new BadRequestException(`${ createUserDto.email } already exists!`);
      } 
      throw new InternalServerErrorException('Something error happend!');
        
    }
  }

  async register( registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create( registerUserDto );

    return {
      user: user,
      token: this.getJwt({ id: user._id! }),
    }
  }

  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    
    const { email , password } = loginDto;

    const user = await this.userModel.findOne({ email: email });

    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials');
    }

    if( !bcryptjs.compareSync( password, user.password! )) {
      throw new UnauthorizedException('Not valid credentials');
    }

    const { password:_, ...rest } = user.toJSON()

    //Generar JWT
    return {
      user: rest,
      token: this.getJwt({ id: user.id }),
    }
  }

  getJwt( payload: JwtPayload ) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string) {
    const user = await this.userModel.findById( id );

    if( !user ) return;

    //console.log(user);

    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

}

