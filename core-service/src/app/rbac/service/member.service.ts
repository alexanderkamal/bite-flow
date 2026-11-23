import { Knex } from "knex";
import {db} from "../../../lib/knex/knex";
import {toMs} from "../../../pkg/utils/time";
import {createPasswordReset} from "../../auth/repository/password-reset.repo";
import {generateOTP, hashOTP} from "../../auth/utils";
import {SystemRole} from "../../user/enums";
import { UserService } from "../../user/service/user.service";
import {CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO} from "../dto/member.dto";
import {MemberBranch} from "../entity/member-branch.entity";
import {MemberStatus} from "../enums";
import {CannotAssignBranchesToOwnerError, CannotCreateOwnerUserError, CannotDeleteOwnerError, CannotUpdateOwnerError, InvalidBranchIdsError, MemberNotFoundError, NoArgumentsCanBeUpdatedError, RoleNotFoundError} from "../errors";
import {countBranchesByIdsAndRestaurantId, setMemberBranches} from "../repository/member-branch.repo";
import { getPermissionsDetailsByRoleName } from "../repository/permission.repo";
import {createRestaurantMember, deleteMember, findMembersByRestaurantId, findMemberWithRoleName, updateMember} from "../repository/restaurant_member.repo";
import { findRoleIdByName } from "../repository/role.repo";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { IEmailProvider } from "../../../pkg/email/email.interface";
import { memberInvitationEmail } from "../templates/member-invitation";

@injectable()
export class MemberService{
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService,
        @inject(TOKENS.EmailProvider) private readonly emailProvider: IEmailProvider,) {}

    async createOwnerMember(restaurantId: number, userId: number, trx: Knex = db){
        const roleId = await findRoleIdByName('owner', trx);
        if(!roleId){
            throw RoleNotFoundError
        }
        const now = new Date();
        const member = await createRestaurantMember(
            {
                restaurantId,
                userId,
                roleId,
                createdAt: now,
                updatedAt: now,
                status: MemberStatus.ACTIVE
            }, trx
        )
        return member;

    }
    
    async createMember(restaurantId: number, data: CreateMemberDTO){
        // dont accept owner role creation
        if(data.role == 'owner') {
            throw CannotCreateOwnerUserError
        }

        // find roleId by role name
        const roleId = await findRoleIdByName(data.role);
        if(!roleId){
            throw RoleNotFoundError
        }

        const branchIds = data.branchIds || [];
        await this.validateBranchOwnership(branchIds, restaurantId);
        
        // create user, member, assign branches
        const trx = await db.transaction();
        try {
            const now = new Date();
            // TODO: make this a service call not repo call, to also handle errors like creating a user with existing phone or email
            const user = await this.userService.create({
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                systemRole: SystemRole.RESTAURANT_USER,
                password: '',
            }, trx);

            const member = await createRestaurantMember(
                {
                    restaurantId,
                    userId: user.id,
                    roleId,
                    createdAt: now,
                    updatedAt: now,
                    status: MemberStatus.INACTIVE
                }, trx
            )
            // TODO: check that those branches belong to that restaurant
            const rows = branchIds.map(branchId => new MemberBranch({
                branchId: branchId,
                memberId: member.id,
                createdAt: now,
            }))
            await setMemberBranches(member.id, rows, trx)

            // generate otp, create password reset record and send email
            // generate an otp
            const otp = generateOTP();
            // hash the otp
            const hashedOtp = hashOTP(otp);
            // insert the otp
            await createPasswordReset({
                    userId: user.id,
                    otpHash: hashedOtp,
                    expiresAt: new Date(Date.now() + toMs(1, 'd')),
                    createdAt: new Date(),
                }, trx
            )
            // TODO: send email // done
            const email = memberInvitationEmail(otp, data.role);
            await this.emailProvider.sendEmail(data.email, email.subject, email.html);
            // console.log(`mocked email sent ${otp}`)

            await trx.commit()
            return {
                message: "Member invited successfully",
                member: {
                    id: member.id,
                    userId: user.id,
                    email: data.email,
                    name: data.name,
                    phone: data.phoneNumber,
                    role: data.role,
                    status: MemberStatus.INACTIVE,
                    branchIds,
                }
            }
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    }

    async listMembers(restaurantId: number){
        // TODO: want to check first if restaurant exists or not, if not throw error
        // but how to do so? we should inject restaurant service inside member service, but restaurant service is referencing member service,
        //  then we have circular dependency, so we should refactor the code to avoid circular dependency
        const members = await findMembersByRestaurantId(restaurantId);
        return members;
    }

    async updateMember(memberId: number, restaurantId: number, data: Partial<UpdateMemberDTO>){
        const result = await findMemberWithRoleName(memberId);
        if(!result || Number(result.member.restaurantId) !==  Number(restaurantId)){
            throw MemberNotFoundError;
        }
        if (data.role === undefined && data.status === undefined) {
            throw NoArgumentsCanBeUpdatedError;
        }
        if (result.roleName === 'owner') {
            throw CannotUpdateOwnerError;
        }

        if(data.role === 'owner'){
            throw CannotCreateOwnerUserError;
        }

        const updateData: {roleId?: number, status?: string} = {};
        if (data.role){
            const roleId = await findRoleIdByName(data.role);
            if(!roleId){
                throw RoleNotFoundError
            }
            updateData.roleId = roleId;
        }
        if (data.status) {
            updateData.status = data.status;
        }
        const updatedMember = await updateMember(memberId, updateData);
        return { member: updatedMember, message: "Member updated successfully" };
    }


    async deleteMember(memberId: number, restaurantId: number){
        const result = await findMemberWithRoleName(memberId);
        console.log("result", result)
        if(!result || Number(result.member.restaurantId) !==  Number(restaurantId)){
            throw MemberNotFoundError;
        }

        if(result.roleName === 'owner'){
            throw CannotDeleteOwnerError;
        }

        await deleteMember(memberId);
        return {message: "Member deleted successfully"};

    }

    async validateBranchOwnership (branchIds: number[], restaurantId: number){
        if(branchIds.length === 0){
            return;
        }
        const count = await countBranchesByIdsAndRestaurantId(branchIds, restaurantId);
        if(count !== branchIds.length){
            throw InvalidBranchIdsError;
        }
    }

    async updateMemberBranches(memberId: number, restaurantId: number, data: UpdateMemberBranchesDTO){

        const result = await findMemberWithRoleName(memberId);
        if(!result || Number(result.member.restaurantId) !==  Number(restaurantId)){
            throw MemberNotFoundError;
        }
        
        if(result.roleName === 'owner'){
            throw CannotAssignBranchesToOwnerError;
        }

        await this.validateBranchOwnership(data.branchIds, restaurantId);

        const now = new Date();
        await setMemberBranches(memberId, data.branchIds.map(branchId => new MemberBranch({
            branchId: branchId,
            memberId: memberId,
            createdAt: now,
        })))
        return {message: "Member branches updated successfully", memberId: memberId, branchIds: data.branchIds};
        
    }

    async getRolePermissions(roleName: string){
        const permissions = await getPermissionsDetailsByRoleName(roleName);
        if(!permissions){
            throw RoleNotFoundError;
        }
        return {role: roleName, permissions};
    }



    
}
