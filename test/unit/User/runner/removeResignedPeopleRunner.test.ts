import { removeResignedPeople } from '@src/core/User/runner/removeResignedPeopleRunner'
import { test } from 'tap'

test('remove resigned people if account is deactivated', async (t) => {
  const email = 'resigned@email.com'
  const getAllUserProfiles = () =>
    Promise.resolve([
      {
        uid: email,
        crew: 'moon',
        company: 'it',
        name: 'resigned',
      },
    ])
  const getSlackAccountStatuses = () =>
    Promise.resolve([
      {
        email: email,
        active: false,
      },
    ])
  const removedPeople: string[] = []
  const removeResigned = (uid: string) => {
    removedPeople.push(uid)
    return Promise.resolve()
  }

  await removeResignedPeople(
    getAllUserProfiles,
    getSlackAccountStatuses,
    removeResigned,
  )

  t.equal(removedPeople.length,1)
  t.equal(removedPeople[0], email)
})

test('not remove user if Slack account is active', async (t) => {
    const email = 'active@email.com'
    const getAllUserProfiles = () =>
      Promise.resolve([
        {
          uid: email,
          crew: 'moon',
          company: 'it',
          name: 'active',
        },
      ])
    const getSlackAccountStatuses = () =>
      Promise.resolve([
        {
          email: email,
          active: true,
        },
      ])
    const removedPeople: string[] = []
    const removeResigned = (uid: string) => {
      removedPeople.push(uid)
      return Promise.resolve()
    }
  
    await removeResignedPeople(
      getAllUserProfiles,
      getSlackAccountStatuses,
      removeResigned,
    )
  
    t.equal(removedPeople.length,0)
})

test('not remove user if account not found in Slack', async (t) => {
    const email = 'active@email.com'
    const getAllUserProfiles = () =>
      Promise.resolve([
        {
          uid: email,
          crew: 'moon',
          company: 'it',
          name: 'active',
        },
      ])
    const getSlackAccountStatuses = () =>
      Promise.resolve([
        {
          email: 'otherEmail@email.com',
          active: true,
        },
      ])
    const removedPeople: string[] = []
    const removeResigned = (uid: string) => {
      removedPeople.push(uid)
      return Promise.resolve()
    }
  
    await removeResignedPeople(
      getAllUserProfiles,
      getSlackAccountStatuses,
      removeResigned,
    )
  
    t.equal(removedPeople.length,0)
})

test('remove account with it.clara.net in slack', async (t) => {
    const email = 'resigned@claranet.com'
    const getAllUserProfiles = () =>
      Promise.resolve([
        {
          uid: email,
          crew: 'moon',
          company: 'it',
          name: 'resigned',
        },
      ])
    const getSlackAccountStatuses = () =>
      Promise.resolve([
        {
          email: 'resigned@it.clara.net',
          active: false,
        },
      ])
    const removedPeople: string[] = []
    const removeResigned = (uid: string) => {
      removedPeople.push(uid)
      return Promise.resolve()
    }
  
    await removeResignedPeople(
      getAllUserProfiles,
      getSlackAccountStatuses,
      removeResigned,
    )
  
    t.equal(removedPeople.length,1)
    t.equal(removedPeople[0], email)
})

