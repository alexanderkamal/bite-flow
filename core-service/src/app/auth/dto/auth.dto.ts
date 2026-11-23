import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { SystemRole } from "../../user/enums";
import { Type } from "class-transformer";

export class RegisterUserDto {
    
    @IsString()
    @MinLength(2)
    name!: string;
    
    @IsString()
    @IsEmail()  
    email!: string;
    
    @IsString()
    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }, 
{ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' })
    password!: string;

    @IsIn([SystemRole.CUSTOMER, SystemRole.DELIVERY_AGENT, SystemRole.RESTAURANT_USER])
    role!: SystemRole;

    @IsOptional()
    @ValidateNested()
    @Type(() => RegisterRestaurantDTO)
    restaurant?: RegisterRestaurantDTO;


    
}

export class LoginUserDto {
    @IsString()
    @IsEmail()  
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class RequestPasswordResetDto {
    @IsString()
    @IsEmail()  
    email!: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsEmail()  
    email!: string;

    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits long.' })
    otp!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }, 
{ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' })
    newPassword!: string;
}

export class RegisterRestaurantDTO{
    @IsString()
    @MinLength(1)
    name!:string;

    @IsOptional()
    @IsString()
    logoURL?: string;

    @IsString()
    @MinLength(1)
    primaryCountry!: string;

}




