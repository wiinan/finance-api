import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class InsertingGoogleStrategyOnUserTable1747291527354
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'provider',
        type: 'varchar(20)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'provider');
  }
}
