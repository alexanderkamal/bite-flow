import { verify } from "crypto";
import { SystemRole } from "../../user/enums";
import { createUser, findUserByEmail, findUserExistsByEmailOrPhone, updateUserPassword } from "../../user/repository/user.repo";
import { LoginUserDto, RegisterUserDto, RequestPasswordResetDto, ResetPasswordDto } from "../dto/auth.dto";
import { cannotSignUpAsSystemAdminError, invalidCredentialsError, invalidOTPError, RestaurantDataIsRequiredError, userAlreadyExistsError } from "../errors";
import { createPasswordReset, findLatestPasswordResetByUserId, updatePasswordResetConsumedAt } from "../repository/password-reset.repo";
import { createRefreshToken,  createAccessToken, hashPassword, comparePasswords, generateOTP, hashOTP, verifyRefreshToken } from "../utils";
import { compose } from "stream";
import { email } from "zod";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { db } from "../../../lib/knex/knex";
import { Knex } from "knex";
import { activateMemberByUserId, findMemberWithRoleNameByUserId } from "../../rbac/repository/restaurant_member.repo";
import { findBranchIdsByMemberId } from "../../rbac/repository/member-branch.repo";
import { userNotFoundError } from "../../user/error";
import { UserService } from "../../user/service/user.service";
import { MemberService } from "../../rbac/service/member.service";
import { MemberNotFoundError } from "../../rbac/errors";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { IEmailProvider } from "../../../pkg/email/email.interface";
import { passwordResetEmail } from "../templates/password-reset";


@injectable()
export class AuthService {
    constructor(
        @inject(TOKENS.UserService) private readonly userService: UserService, 
        @inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService,
        @inject(TOKENS.MemberService) private readonly memberService: MemberService,
        @inject(TOKENS.EmailProvider) private readonly emailProvider: IEmailProvider
    ) {}

    register = async (userData: RegisterUserDto) => {

        if (userData.role == SystemRole.SYSTEM_ADMIN) {
            throw cannotSignUpAsSystemAdminError;
        }


        // // check if user already exists
        // const existingUser = await findUserExistsByEmailOrPhone(userData.email, userData.phone);
        // // if exists, throw an error
        // if (existingUser) {
        //     throw userAlreadyExistsError;
        // }
        // // if not, hash the password
        // const hashedPassword = await hashPassword(userData.password);
        
        // create a new user instance
        // we will open transaction as if something went wrong should rollback to be atomic as we are running two queries if restaurant_user
        const trx = await db.transaction();
        let user;
        let restaurant;
        let member;
        let restaurantMemberInfo: {restaurantId?: number, restaurantRole?: string, branchIds?: number[]} = {};

        try {
        user = await this.userService.create({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            systemRole: userData.role

        }, trx);

        // check if user of type Restaurant user then create restaurant
        if(user.systemRole == SystemRole.RESTAURANT_USER){
            if(userData.restaurant == undefined){
                throw RestaurantDataIsRequiredError;
            }
            restaurant = await this.restaurantService.createRestaurant(user.id, userData.restaurant, trx);

            // insert the owner member via member service
            member = await this.memberService.createOwnerMember(restaurant.id, user.id, trx);
            restaurantMemberInfo = {
                restaurantId: restaurant.id,
                restaurantRole: "owner",
                branchIds: []
            };
        }

        await trx.commit();

    } catch (error){
        await trx.rollback();
        throw error;
    }

        // create access token and refresh token
        const payload = {
            userId: user.id,
            email: user.email,
            systemRole: user.systemRole,
            ...restaurantMemberInfo
        };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);
        // return the tokens and user data
        return {
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt,
            },
            restaurant,
            member
        };


    
    }




    login = async (userData: LoginUserDto): Promise<{ message: string; accessToken: string; refreshToken: string; user: { id: number; name: string; email: string; phone: string; systemRole: SystemRole; createdAt: Date; } }> => {
        // find the user by email
        const user = await findUserByEmail(userData.email);

        // if not found, throw an error
        if (!user) {
            throw invalidCredentialsError;
        }

        // if found, compare the password with the hashed password
        const isPasswordValid = await comparePasswords(userData.password, user.passwordHash);

        // if password does not match, throw an error
        if (!isPasswordValid) {
            throw invalidCredentialsError;
        }

        let restaurantMemberInfo = null
        if(user.systemRole == SystemRole.RESTAURANT_USER) {
            const memberData =  await findMemberWithRoleNameByUserId(user.id);
            if(!memberData) {
                throw MemberNotFoundError;
            }
            const branchIds = await findBranchIdsByMemberId(memberData.member.id);
            if(memberData)  {
                restaurantMemberInfo = {
                    restaurantId: memberData.member.restaurantId,
                    restaurantRole: memberData.roleName,
                    branchIds
                }
            }
        }

        // if password matches, create access token and refresh token
        const payload = {
            userId: user.id,
            email: user.email,
            systemRole: user.systemRole,
            ...restaurantMemberInfo
        };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        // return the tokens and user data
        return {
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt,
            },
        };


    }

    forgetPassword = async (userData: RequestPasswordResetDto): Promise<{ message: string }> => {
        // find the user by email
        const user = await findUserByEmail(userData.email);

        // if not found, we should not reveal that the user does not exist for security reasons.
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${userData.email}`);
            return {
                message: "Password reset instructions sent to your email if you have an account.",
            };
        }

        // if found, generate otp
        const otp = generateOTP();

        // hash the otp
        const hashedOTP = hashOTP(otp);

        // create a password reset entry in the database and add the hashed otp, user id, and expiration time
        const passwordReset = {
            userId: user.id,
            otpHash: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
            createdAt: new Date(),
        };

        await createPasswordReset(passwordReset);

        // TODO: send email with reset link   //Done
        // (Implementation for sending email would go here)
        const email = passwordResetEmail(otp);
        await this.emailProvider.sendEmail(userData.email, email.subject, email.html);
        // log the otp for testing purposes (in production, you would send this via email)
        // console.log(`Password reset OTP for user ${user.email}: ${otp}`);

        return {
            message: "Password reset instructions sent to your email if you have an account.",
        };


    };

    resetPassword = async (userData: ResetPasswordDto)  => {
        // find the user by email
        const user = await findUserByEmail(userData.email);

        // if not found, throw an error
        if (!user) {
            throw invalidOTPError;
        }

        // find the password reset entry by user id
        const passwordReset = await findLatestPasswordResetByUserId(user.id);

        // if not found or expired, throw an error
        if (!passwordReset || passwordReset.isExpired()) {
            throw invalidOTPError;
        }

        // hash the provided otp and compare with the stored hashed otp
        const hashedOTP = hashOTP(userData.otp);

        if (hashedOTP !== passwordReset.otpHash) {
            throw invalidOTPError;
        }
        
        // hash the new password
        const hashedNewPassword = await hashPassword(userData.newPassword);

        // update the user's password in the database
        await updateUserPassword(user.id, hashedNewPassword);
        
        // mark the password reset entry as consumed
        await updatePasswordResetConsumedAt(passwordReset.id);

        return user;



    }

    refresh = async (refreshToken: string) => {
        if(!refreshToken){
            throw invalidCredentialsError
        }
        const decoded = verifyRefreshToken(refreshToken)
        const payload = {
            userId: decoded.userId,
            email: decoded.email,
            systemRole: decoded.systemRole,
            restaurantId: decoded.restaurantId,
            restaurantRole: decoded.restaurantRole,
            branchIds: decoded.branchIds
        }
        const accessToken = createAccessToken(payload)
        return {accessToken};

    }

    acceptInvite = async(data: ResetPasswordDto )=> {
        const user = await this.resetPassword(data)
        // activate member
        await activateMemberByUserId(user.id)
    }


}
