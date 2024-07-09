import {
    CnaUserProfileListType,
    UserCompanyType,
    UserWithProfileType
} from '@src/core/User/model/user.model'
import {JwtTokenType} from '@src/core/JwtToken/model/jwtToken.model'
import {UserProfileService} from './UserProfileService'

export class UserService {
    constructor(private userProfileService: UserProfileService) {
    }

    async getUser(jwtToken: JwtTokenType): Promise<UserWithProfileType> {
        const userProfile = await this.userProfileService.getUserProfile(
            jwtToken.email,
        )
        if (!userProfile) {
            return {
                ...jwtToken,
            }
        }
        return {
            ...jwtToken,
            crew: userProfile.crew,
            company: userProfile.company,
            crewLeader: userProfile.crewLeader,
            place: userProfile.place,
            workingExperience: userProfile.workingExperience,
            education: userProfile.education,
            certifications: userProfile.certifications,
        }
    }

    async getUsers(params: UserCompanyType): Promise<CnaUserProfileListType> {

        let users = []
        if (params.company === 'it') {
            users = ['micol.panetta@claranet.com', 'emanuele.laera@claranet.com']
        } else {
            users = ['stefania.ceccacci@claranet.com', 'manuel.gherardi@claranet.com']
        }

        return Promise.all(users.map(async user => {
            const userProfile = await this.userProfileService.getCompleteUserProfile(
                user
            )

            if (!userProfile) {
                throw Error('User not found')
            }

            return {
                email: userProfile?.uid,
                id: userProfile?.uid,
                name: userProfile?.name,
            }
        }))
    }
}
