import automation from './automation'

beforeAll(async () => {
  await automation.deploy()
})

afterAll(async () => {
  await automation.destroy()
  await automation.removeStack()
})

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe("Resource's shape", () => {
  it('should get 1 vpc, 4 subnets', async () => {
    try {
      const stacks = await automation.getStacks()
      const vpc = stacks.deployment.resources.filter(
        (resource: any) => resource.type == 'aws:ec2/vpc:Vpc'
      )
      const subnets = stacks.deployment.resources.filter(
        (resource: any) => resource.type == 'aws:ec2/subnet:Subnet'
      )
      expect(vpc).toHaveLength(1)
      expect(subnets).toHaveLength(4)
    } catch (error) {
      await automation.destroy()
      await automation.removeStack()
      throw error
    }
  })
})
