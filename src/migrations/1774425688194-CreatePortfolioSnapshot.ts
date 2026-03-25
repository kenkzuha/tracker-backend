import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePortfolioSnapshot1774425688194 implements MigrationInterface {
    name = 'CreatePortfolioSnapshot1774425688194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "portfolio_snapshot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalValue" numeric(18,2) NOT NULL, "date" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "portfolioId" uuid, CONSTRAINT "PK_5416b78df6fa221ff0eb7a65000" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "portfolio_snapshot" ADD CONSTRAINT "FK_1d47d90f710ddd3296c259bbcc1" FOREIGN KEY ("portfolioId") REFERENCES "portfolio_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio_snapshot" DROP CONSTRAINT "FK_1d47d90f710ddd3296c259bbcc1"`);
        await queryRunner.query(`DROP TABLE "portfolio_snapshot"`);
    }

}
