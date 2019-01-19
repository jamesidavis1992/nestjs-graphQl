import { Injectable } from '@nestjs/common';
import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-express';
import { existsSync, lstatSync, readFileSync } from 'fs';
import { GraphQLSchema } from 'graphql';
import { MergeInfo } from 'graphql-tools/dist/Interfaces';
import { isEmpty } from 'lodash';
import { GraphQLAstExplorer } from './graphql-ast.explorer';
import { GraphQLSchemaBuilder } from './graphql-schema-builder';
import { GqlModuleOptions } from './interfaces/gql-module-options.interface';
import { DelegatesExplorerService } from './services/delegates-explorer.service';
import { ResolversExplorerService } from './services/resolvers-explorer.service';
import { ScalarsExplorerService } from './services/scalars-explorer.service';
import { extend } from './utils/extend.util';

@Injectable()
export class GraphQLFactory {
  constructor(
    private readonly resolversExplorerService: ResolversExplorerService,
    private readonly delegatesExplorerService: DelegatesExplorerService,
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly graphqlAstExplorer: GraphQLAstExplorer,
    private readonly gqlSchemaBuilder: GraphQLSchemaBuilder,
  ) {}

  async mergeOptions(
    options: GqlModuleOptions = { typeDefs: [] },
  ): Promise<GqlModuleOptions> {
    const resolvers = this.resolversExplorerService.explore();
    const typesResolvers = extend(
      this.scalarsExplorerService.explore(),
      resolvers,
    );
    const transformSchema = async (schema: GraphQLSchema) =>
      options.transformSchema ? await options.transformSchema(schema) : schema;

    if (options.autoSchemaFile) {
      const typeDefs = await this.gqlSchemaBuilder.build(
        options.autoSchemaFile,
        options.buildSchemaOptions,
      );
      const executableSchema = makeExecutableSchema({
        resolvers: extend(typesResolvers, options.resolvers),
        typeDefs: gql`
          ${typeDefs}
        `,
        resolverValidationOptions: options.resolverValidationOptions,
      });
      const schema = options.schema
        ? mergeSchemas({
            schemas: [options.schema, executableSchema],
          })
        : executableSchema;

      return {
        ...options,
        typeDefs: undefined,
        schema: await transformSchema(schema),
      };
    }
    if (isEmpty(options.typeDefs)) {
      return {
        ...options,
        typeDefs: undefined,
        schema: await transformSchema(options.schema),
      };
    }
    const executableSchema = makeExecutableSchema({
      resolvers: extend(typesResolvers, options.resolvers),
      directiveResolvers: options.directiveResolvers,
      schemaDirectives: options.schemaDirectives as any,
      typeDefs: gql`
        ${options.typeDefs}
      `,
      resolverValidationOptions: options.resolverValidationOptions,
    });
    const schema = options.schema
      ? mergeSchemas({
          schemas: [options.schema, executableSchema],
        })
      : executableSchema;

    return {
      ...options,
      typeDefs: undefined,
      schema: await transformSchema(schema),
    };
  }

  createDelegates(): (mergeInfo: MergeInfo) => any {
    return this.delegatesExplorerService.explore();
  }

  async generateDefinitions(
    typeDefs: string | string[],
    options: GqlModuleOptions,
  ) {
    if (isEmpty(typeDefs) || !options.definitions) {
      return;
    }
    const tsFile = this.graphqlAstExplorer.explore(
      gql`
        ${typeDefs}
      `,
      options.definitions.path,
      options.definitions.outputAs,
    );
    if (
      !existsSync(options.definitions.path) ||
      !lstatSync(options.definitions.path).isFile() ||
      readFileSync(options.definitions.path, 'utf8') !== tsFile.getText()
    ) {
      await tsFile.save();
    }
  }
}
