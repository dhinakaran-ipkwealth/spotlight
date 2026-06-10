import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { FeedbackService } from './feedback.service';

function getClientIp(req: Request): string | undefined {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip;
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() req: Request,
  ) {
    const feedback = await this.feedbackService.create(createFeedbackDto, {
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  }

  @Get()
  async findAll(@Query() query: QueryFeedbackDto) {
    const result = await this.feedbackService.findAll(query);

    return {
      success: true,
      message: 'Feedback list fetched successfully',
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const feedback = await this.feedbackService.findOne(id);

    return {
      success: true,
      message: 'Feedback fetched successfully',
      data: feedback,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const feedback = await this.feedbackService.remove(id);

    return {
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback,
    };
  }
}
