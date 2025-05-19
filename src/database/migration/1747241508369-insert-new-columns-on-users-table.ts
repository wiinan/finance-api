import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class InsertNewColumnsOnUsersTable1747241508369
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'incomeBalance',
          type: 'decimal',
          isNullable: false,
          default: 0,
          scale: 4,
        }),
      ),
      queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'expenseBalance',
          type: 'decimal',
          isNullable: false,
          default: 0,
          scale: 4,
        }),
      ),
      queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'receivedBalance',
          type: 'decimal',
          isNullable: false,
          default: 0,
          scale: 4,
        }),
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.dropColumn('users', 'incomeBalance'),
      queryRunner.dropColumn('users', 'expenseBalance'),
      queryRunner.dropColumn('users', 'receivedBalance'),
    ]);
  }
}
