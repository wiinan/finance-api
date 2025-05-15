import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFinanceInstallmentsTable1747260501342
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'finance_installments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: false,
            default: 0,
            scale: 4,
          },
          {
            name: 'liquidPrice',
            type: 'decimal',
            isNullable: false,
            default: 0,
            scale: 4,
          },
          {
            name: 'receivedValue',
            type: 'decimal',
            isNullable: false,
            default: 0,
            scale: 4,
          },
          {
            name: 'description',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'competence',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'paidAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'financeId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'statusId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'paymentMethodId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'installments',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'installment',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'payerInfo',
            type: 'varchar(255)',
            isNullable: true,
          },
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
      queryRunner.createForeignKey(
        'finance_installments',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      ),
      queryRunner.createForeignKey(
        'finance_installments',
        new TableForeignKey({
          columnNames: ['financeId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'finances',
          onDelete: 'CASCADE',
        }),
      ),
      await queryRunner.createForeignKey(
        'finance_installments',
        new TableForeignKey({
          columnNames: ['paymentMethodId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'payment_methods',
        }),
      ),
      queryRunner.createForeignKey(
        'finance_installments',
        new TableForeignKey({
          columnNames: ['statusId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'finance_status',
        }),
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('finance_installments');
  }
}
