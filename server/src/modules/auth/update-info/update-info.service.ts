import { Injectable, Body, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/core/schemas/user.schema';
import { CloudinaryService } from 'src/core/utils/cloudinary/cloudinary.service';

@Injectable()
export class UpdateInfoService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private _jwtservice: JwtService, private readonly cloudinaryService: CloudinaryService) { }
  options = {
    width: 1870,
    height: 1250,
    crop: 'fill',
    gravity: 'auto',
    folder: 'Africano/Food'
  }
  async updateInfo(body, token, file) {
    const decoded = this._jwtservice.verify(token, { secret: "mo2" });
    if (!decoded) {
      throw new HttpException('invalid token', HttpStatus.FORBIDDEN);
    }
    const { userId } = decoded
    if (file) {
      const foodImage = await this.cloudinaryService.uploadFile(file, this.options).catch(() => {
        throw new BadRequestException('Invalid file type.');
      });

      body.image = foodImage.url
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(userId, body, { new: true })
    if (!updatedUser) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);

    }
    return { message: "updated successfully", updatedUser }

  }

}