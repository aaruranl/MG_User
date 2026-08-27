export enum UserType {
  ADMIN = 'Admin',
  AGENT = 'Agent',
  MEMBER = 'Member'
}

export const userRoleNames = {
  adminUser: 'Admin',
  member: 'Member'
}

export const clientData = {
  ADMIN: {
    name: 'mgate',
    secretKey: 'admin',
  },

  AGENT: {
    name: 'Agent',
    secretKey: 'Agent123',
  },

  MEMBER: {
    name:'member',
    secretKey:'member123'
  }
}


export const matrimonyConfig = {
  userType: UserType.ADMIN,
  clientData: clientData.ADMIN
}

export const matrimonyAgentConfig = {
  userType: UserType.AGENT,
  clientData: clientData.AGENT
}

export const matrimonyMemberConfig = {
  userType: UserType.MEMBER,
  clientData: clientData.MEMBER
}
