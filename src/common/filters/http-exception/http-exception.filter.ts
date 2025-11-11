import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ErrorResponse } from '../../interfaces/error-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HttpException (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name.replace('Exception', '');
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.constructor.name.replace('Exception', '');

        // Handle validation errors (class-validator)
        if (Array.isArray(message) && message.length > 0) {
          // Format validation errors
          message = message.map((msg: any) => {
            if (typeof msg === 'string') return msg;
            if (msg.constraints) {
              return Object.values(msg.constraints).join(', ');
            }
            return msg;
          });
        }
      }
    }
    // Handle Prisma errors
    else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002':
          const target = Array.isArray(exception.meta?.target)
            ? exception.meta.target.join(', ')
            : exception.meta?.target || 'unknown';
          message = `Unique constraint violation on field: ${target}`;
          error = 'Conflict';
          status = HttpStatus.CONFLICT;
          break;
        case 'P2025':
          message = 'Record not found';
          error = 'Not Found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          break;
        case 'P2014':
          message = 'Invalid ID provided';
          break;
        default:
          message = `Database error: ${exception.message}`;
      }
    }
    // Handle Prisma validation errors
    else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Invalid data provided';
    }
    // Handle unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Exception caught:', {
        exception,
        message,
        status,
        path: request.url,
        method: request.method,
      });
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
