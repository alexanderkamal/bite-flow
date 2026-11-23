import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: String;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(11)
    phone?: String;
}

export class CreateRestaurantOwnerDTO {
    
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
}