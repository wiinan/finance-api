import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePaymentMethosTable1747257792370
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_methods',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'description',
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
            name: 'isDeleted',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'finances',
      new TableForeignKey({
        columnNames: ['paymentMethodId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'payment_methods',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('finances', 'paymentMethodId');
    await queryRunner.dropTable('payment_methods');
  }
}
