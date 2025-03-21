import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { CompanyConnectionsRepositoryInterface } from '../repository/CompanyConnectionsRepositoryInterface'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CompaniesConnectionType } from '@src/core/Company/model/Company'
import { CompanyConnectionsPostBodyType } from '@src/core/CompanyConnections/service/dto/CompanyConnectionsPostBody'
import { UniqueConstraintViolationException } from '@src/shared/exceptions/UniqueConstraintViolationException'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'
import { CompanyConnectionsDeleteBodyType } from '@src/core/CompanyConnections/service/dto/CompanyConnectionsDeleteBody'

export class CompanyConnectionsService {
  constructor(
    private companyRepository: CompanyRepositoryInterface,
    private companyConnectionsRepository: CompanyConnectionsRepositoryInterface,
  ) {}

  async getMine(jwtToken: JwtTokenType): Promise<CompaniesConnectionType> {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const connections = await this.companyConnectionsRepository.findAll(
      company.id,
    )

    return connections
  }

  async create(body: CompanyConnectionsPostBodyType): Promise<void> {
    const requester = await this.companyRepository.findById(body.requesterId)

    if (!requester) {
      throw new NotFoundException('Requester not found')
    }

    const correspondent = await this.companyRepository.findById(
      body.correspondentId,
    )

    if (!correspondent) {
      throw new NotFoundException('Correspondent not found')
    }

    try {
      await this.companyConnectionsRepository.create(
        requester.id,
        correspondent.id,
      )
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new BadRequestException('Connection already exists')
      }
      throw error
    }
  }

  async delete(body: CompanyConnectionsDeleteBodyType): Promise<void> {
    const requester = await this.companyRepository.findById(body.requesterId)

    if (!requester) {
      throw new NotFoundException('Requester not found')
    }

    const correspondent = await this.companyRepository.findById(
      body.correspondentId,
    )

    if (!correspondent) {
      throw new NotFoundException('Correspondent not found')
    }

    await this.companyConnectionsRepository.delete(
      requester.id,
      correspondent.id,
    )
  }
}
