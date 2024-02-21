import { accountstatusType } from "@src/core/Slack/model/slack.model";
import { UserProfileWithUidType } from "../model/user.model";

export async function removeResignedPeople(
  getAllUserProfiles: () => Promise<UserProfileWithUidType[]>,
  getSlackAccountStatuses: () => Promise<accountstatusType[]>,
  removeResigned: (uid: string) => Promise<void>,
) {
    const slackUsersStatuses = await getSlackAccountStatuses()
    const portfolioUsers = await getAllUserProfiles()
    portfolioUsers.forEach(async (user) => {
        const userEmails = [
          user.uid.toLowerCase(),
          user.uid
            .replace('claranet.com', `${user.company}.clara.net`)
            .toLowerCase(),
        ]
        const slackUser = slackUsersStatuses.find((u) =>
          userEmails.includes(u.email.toLowerCase()),
        )
        if (slackUser) {
          if (!slackUser.active) {
            console.info(`removing ${user.uid}`)
            //await removeResigned(user.uid)
          }
        } else {
          console.warn(`User ${user.uid} not found in slack`)
        }
      })
}
