import { Get, Query } from '@nestjs/common';
import { CreditService } from './credit.service';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { FindCreditBodyDto } from './dto/req/find-credit-body.dto';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/api-ok-response-paginated.decorator';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { CreditDto } from './dto/res/credit.dto';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';

@ApiTags('credit')
@WorkspaceController('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get()
  @ApiOperation({
    summary: '크레딧 조회',
    description: '크레딧을 조회합니다.',
  })
  @Serialize(CreditDto, true)
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  @ApiOkResponsePaginated(CreditDto)
  async findAll(
    @ReqWorkspace() { id }: Workspace,
    @Query() dto: FindCreditBodyDto,
  ) {
    const nodes = await this.creditService.findAll(id, dto);
    const total = await this.creditService.count(id, dto);

    return { nodes, total };
  }
}
