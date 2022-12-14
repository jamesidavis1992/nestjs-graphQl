import { ArgumentsHost, Catch, UnauthorizedException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch(UnauthorizedException)
export class UnauthorizedFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    exception.message = 'Unauthorized error';
    return exception;
  }
}
