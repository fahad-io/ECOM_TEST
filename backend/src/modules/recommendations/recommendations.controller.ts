import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller()
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Public()
  @Get('products/:id/recommendations')
  @ApiOperation({ summary: 'Related products for a product detail page' })
  forProduct(@Param('id') id: string) {
    return this.recommendations.forProduct(id);
  }

  @Get('recommendations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Personalized recommendations for the current user' })
  forUser(@CurrentUser() user: AuthUser) {
    return this.recommendations.forUser(user.userId);
  }
}
