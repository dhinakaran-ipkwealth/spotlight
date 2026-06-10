import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';

export interface SubmissionMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
    meta: SubmissionMeta,
  ): Promise<FeedbackDocument> {
    if (!createFeedbackDto.feedbackText?.trim()) {
      throw new BadRequestException('feedbackText must not be empty');
    }

    const feedback = new this.feedbackModel({
      ...createFeedbackDto,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      submittedAt: new Date(),
    });

    return feedback.save();
  }

  async findAll(query: QueryFeedbackDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortOrder = query.sort === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [{ customerName: searchRegex }, { mobile: searchRegex }];
    }

    const [items, total] = await Promise.all([
      this.feedbackModel
        .find(filter)
        .sort({ createdAt: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.feedbackModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<FeedbackDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid feedback id');
    }

    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }

    return feedback;
  }

  async remove(id: string): Promise<FeedbackDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid feedback id');
    }

    const feedback = await this.feedbackModel.findByIdAndDelete(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }

    return feedback;
  }
}
