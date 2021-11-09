import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { Module } from '@nestjs/common';
import {
  GATEWAY_BUILD_SERVICE,
  GraphQLModule,
} from '@nestjs/graphql-experimental';
import { ApolloGatewayGraphQLAdapter } from '../../../lib/adapters';

@Module({
  providers: [
    {
      provide: GATEWAY_BUILD_SERVICE,
      useValue: ({ name, url }) => {
        return new RemoteGraphQLDataSource({ url });
      },
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
class BuildServiceModule {}

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      adapter: ApolloGatewayGraphQLAdapter,
      useFactory: async () => ({
        gateway: {
          serviceList: [
            { name: 'users', url: 'http://localhost:3001/graphql' },
            { name: 'posts', url: 'http://localhost:3002/graphql' },
          ],
        },
      }),
      imports: [BuildServiceModule],
      inject: [GATEWAY_BUILD_SERVICE],
    }),
  ],
})
export class AppModule {}
