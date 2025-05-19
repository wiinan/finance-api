import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePaymentLinkFinanceInfoTable1747259998460
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_link_finance_info',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'link', type: 'text', isNullable: false },
          {
            name: 'taxes',
            type: 'decimal',
            isNullable: false,
            default: 0,
            scale: 4,
          },
          { name: 'financeId', type: 'int', isNullable: false },
          { name: 'userId', type: 'int', isNullable: false },
          {
            name: 'createdAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
        ],
      }),
    );

    await Promise.all([
      await queryRunner.createForeignKey(
        'payment_link_finance_info',
        new TableForeignKey({
          columnNames: ['financeId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'finances',
          onDelete: 'CASCADE',
        }),
      ),
      await queryRunner.createForeignKey(
        'payment_link_finance_info',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment_link_finance_info');
  }
}
