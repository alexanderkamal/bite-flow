import { Type } from "class-transformer";
import { IsEmail, IsEnum, isEnum, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength, ValidateNested } from "class-validator";
import { RestaurantStatus } from "../enums";

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



export class CreateRestaurantWithOwnerByAdminDTO {
    @ValidateNested()
    @Type(() => CreateRestaurantOwnerDTO)
    owner!: CreateRestaurantOwnerDTO;

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

export class UpdateRestaurantByIdDTO {
        @IsString()
        @MinLength(1)
        @IsOptional()
        name!:string;
    
        @IsOptional()
        @IsString()
        logoURL?: string;
    
        @IsString()
        @MinLength(1)
        @IsOptional()
        primaryCountry!: string;
}

export class UpdateRestaurantStatusDTO {
    @IsEnum(RestaurantStatus)
    status!: RestaurantStatus;
}