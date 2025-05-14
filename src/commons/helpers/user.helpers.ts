import { UserFilterDto, WhereUserParamsDto } from '../users/dtos/user.dto';

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
}
