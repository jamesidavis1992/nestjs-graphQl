import {
  GqlModuleAsyncOptions,
  GqlModuleOptions,
  GqlOptionsFactory,
} from '@nestjs/graphql';
import { MercuriusCommonOptions, MercuriusGatewayOptions } from 'mercurius';

export type MercuriusGatewayDriverConfig = GqlModuleOptions &
  MercuriusCommonOptions &
  MercuriusGatewayOptions;

export type MercuriusGatewayDriverConfigFactory =
  GqlOptionsFactory<MercuriusGatewayDriverConfig>;
export type MercuriusGatewayDriverAsyncConfig =
  GqlModuleAsyncOptions<MercuriusGatewayDriverConfig>;
