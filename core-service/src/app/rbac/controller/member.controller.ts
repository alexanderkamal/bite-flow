import {NextFunction, Response, Request} from "express";
import {validateBody} from "../../../lib/validation/validate";
import {CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO} from "../dto/member.dto";
import { MemberService} from "../service/member.service";
import { TOKENS } from "../../../lib/di/tokens";
import { inject, injectable } from "tsyringe";

@injectable()
export class MemberController {
    constructor(@inject(TOKENS.MemberService) private readonly memberService: MemberService) {}

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateMemberDTO,req.body);
            const result = await this.memberService.createMember(Number(req.params.restaurantId), data);
            res.status(201).send(result);
        }
        catch (error) {
            next(error);
        }
    }

    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const members = await this.memberService.listMembers(restaurantId);
            res.status(200).json({data: members});
        } catch (error) {
            next(error);
        }
    }

    updateMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            const result = await this.memberService.updateMember(memberId, restaurantId, data);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    deleteMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            const result = await this.memberService.deleteMember(memberId, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateMemberBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberBranchesDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            const result = await this.memberService.updateMemberBranches(memberId, restaurantId, data);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roleName = req.params.roleName as string;
            const permissions = await this.memberService.getRolePermissions(roleName);
            res.status(200).json({data: permissions});
        } catch (error) {
            next(error);
        }
    }
}
