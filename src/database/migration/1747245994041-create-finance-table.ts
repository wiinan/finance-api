import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFinanceTable1747245994041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'finances',
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
            name: 'typeId',
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

    await queryRunner.createForeignKey(
      'finances',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('finances');
  }
}
