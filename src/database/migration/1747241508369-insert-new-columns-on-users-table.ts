import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class InsertNewColumnsOnUsersTable1747241508369
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'balance',
        type: 'decimal',
        isNullable: false,
        default: 0,
        scale: 4,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'balance');
  }
}
