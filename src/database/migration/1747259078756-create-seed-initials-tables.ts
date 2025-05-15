import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeedInitialsTables1747259078756
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(
        `INSERT INTO
            users (name, email, password, "isRoot")
            VALUES ('admin', 'admin@gmail.com', '123456', true)`,
      ),
      queryRunner.query(
        `INSERT INTO
            types (name, "userId", description)
        VALUES
            ('OUT', 1, 'Finança de entrada'),
            ('INPUT', 1, 'Finança de saida')`,
      ),
      queryRunner.query(
        `INSERT INTO
            finance_status (name)
        VALUES
            ('OPEN'),
            ('PAID'),
            ('PARTIAL'),
            ('CLOSED'),
            ('CANCELED'),
            ('REFUND')`,
      ),
      queryRunner.query(`
        INSERT INTO
            payment_methods (name)
        VALUES
            ('Pix'),
            ('Cartão'),
            ('Transferencia'),
            ('Link de pagamento')`),
    ]);
  }

  public async down(): Promise<void> {}
}
