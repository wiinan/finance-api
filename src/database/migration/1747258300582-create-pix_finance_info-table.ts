import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePixFinanceInfoTable1747258300582
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pix_finance_info',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'type', type: 'varchar(25)', isNullable: false },
          { name: 'key', type: 'varchar(255)', isNullable: false },
          { name: 'qrCode', type: 'varchar(255)', isNullable: true },
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
        'pix_finance_info',
        new TableForeignKey({
          columnNames: ['financeId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'finances',
          onDelete: 'CASCADE',
        }),
      ),
      queryRunner.createForeignKey(
        'pix_finance_info',
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
    await queryRunner.dropTable('pix_finance_info');
  }
}
