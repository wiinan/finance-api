import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUserLogsTable1747365395345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'editorId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar(25)',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'new_options',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'old_options',
            type: 'json',
            isNullable: true,
          },
        ],
      }),
    );

    await Promise.all([
      queryRunner.createForeignKey(
        'user_logs',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      ),
      queryRunner.createForeignKey(
        'user_logs',
        new TableForeignKey({
          columnNames: ['editorId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_logs');
  }
}
