import { User } from 'src/database/entities';
import {
  UserBalanceDto,
  UserFilterDto,
  WhereUserParamsDto,
} from '../dtos/user.dto';
import { CalculateUtils } from 'src/helpers/calculate';

export class UserHelper {
  private static getConcatQuery(hasInitialFilter: boolean): string {
    return hasInitialFilter ? ' AND' : '';
  }

  public static getWhereParams(filter?: UserFilterDto) {
    const options: WhereUserParamsDto = {
      parameters: {},
      query: 'isDeleted = false',
    };
    let hasInitialFilter: boolean = true;

    if (!filter) {
      return options;
    }

    const { id, name, email, isRoot, isDeleted } = filter;

    if (id) {
      options.parameters.id = id;
      options.query = 'id = :id';
      return options;
    }

    if (isDeleted) {
      options.query = '';
      hasInitialFilter = false;
    }

    if (name) {
      options.parameters.name = `%${name}%`;
      options.query += `${this.getConcatQuery(hasInitialFilter)} name ILIKE :name`;
      hasInitialFilter = true;
    }

    if (email) {
      options.parameters.email = `%${email}%`;
      options.query += `${this.getConcatQuery(hasInitialFilter)} email ILIKE :email`;
      hasInitialFilter = true;
    }

    if (isRoot) {
      options.query += `${this.getConcatQuery(hasInitialFilter)} isRoot = true`;
      hasInitialFilter = true;
    }

    return options;
  }

  public static calculateBalances(
    user: User,
    balance: UserBalanceDto,
  ): UserBalanceDto {
    return Object.keys(balance).reduce(
      (acc, key: string) => {
        if (!balance[key]) {
          return acc;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        acc[key] = CalculateUtils.sumValues([user[key], balance[key]]);

        return acc;
      },
      {
        incomeBalance: ~~user.incomeBalance,
        expenseBalance: ~~user.expenseBalance,
        receivedBalance: ~~user.receivedBalance,
      },
    );
  }
}
