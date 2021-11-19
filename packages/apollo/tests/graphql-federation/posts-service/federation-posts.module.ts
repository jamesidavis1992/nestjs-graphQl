import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
import { join } from 'path';
import { ApolloDriverConfig } from '../../../lib';
import { ApolloFederationDriver } from '../../../lib/drivers';
import { PostsModule } from './posts/posts.module';
import { UpperCaseDirective } from './posts/upper.directive';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: [join(__dirname, '**/*.graphql')],
      schemaDirectives: {
        upper: UpperCaseDirective,
      },
      plugins: [ApolloServerPluginInlineTraceDisabled()],
    }),
    PostsModule,
  ],
})
export class AppModule {}
