import * as pulumi from '@pulumi/pulumi'
export const pulumiSetMock = (): void => {
  pulumi.runtime.setMocks({
    newResource: (
      args: pulumi.runtime.MockResourceArgs
    ): {
      // eslint-disable-next-line
      state: any
      id: string
    } => {
      pulumi.log.debug(`set mock args: ${args}`)
      return {
        id: args.inputs.name + '_id',
        state: args.inputs,
      }
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
      switch (args.token) {
        case 'aws:index/getAvailabilityZones:getAvailabilityZones':
          return {
            names: ['us-west-2a', 'us-west-2b'],
            zoneIds: ['west2a', 'west2b'],
          }
      }
      return args
    },
  })
}
