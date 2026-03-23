import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePortfolioAndAsset1774281195332 implements MigrationInterface {
    name = 'CreatePortfolioAndAsset1774281195332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "asset_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "symbol" character varying NOT NULL, "name" character varying NOT NULL, "quantity" numeric(18,8) NOT NULL, "buyPrice" numeric(18,8) NOT NULL, "type" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "portfolioId" uuid, CONSTRAINT "PK_038b7b28b83db2205747ef9912e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "portfolio_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_01c144e796498f5f4c56f7dfcbc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "asset_entity" ADD CONSTRAINT "FK_ec59a3b5f427f5d6d0f4361d0a3" FOREIGN KEY ("portfolioId") REFERENCES "portfolio_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_entity" ADD CONSTRAINT "FK_4de263958a55a13ca67d80b89d0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio_entity" DROP CONSTRAINT "FK_4de263958a55a13ca67d80b89d0"`);
        await queryRunner.query(`ALTER TABLE "asset_entity" DROP CONSTRAINT "FK_ec59a3b5f427f5d6d0f4361d0a3"`);
        await queryRunner.query(`DROP TABLE "portfolio_entity"`);
        await queryRunner.query(`DROP TABLE "asset_entity"`);
    }

}
