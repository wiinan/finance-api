import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCreditCardFinanceInfoTable1747258897900
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'credit_card_finance_info',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'cvv', type: 'varchar(6)', isNullable: false },
          { name: 'number', type: 'varchar(255)', isNullable: false },
          { name: 'titleName', type: 'varchar(255)', isNullable: false },
          { name: 'dueDate', type: 'varchar(7)', isNullable: false },
          { name: 'name', type: 'varchar(255)', isNullable: false },
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
      queryRunner.createForeignKey(
        'credit_card_finance_info',
        new TableForeignKey({
          columnNames: ['financeId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'finances',
          onDelete: 'CASCADE',
        }),
      ),
      queryRunner.createForeignKey(
        'credit_card_finance_info',
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
    await queryRunner.dropTable('credit_card_finance_info');
  }
}
