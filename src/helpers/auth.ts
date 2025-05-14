import { hashSync, compareSync } from 'bcrypt';
import { Request } from 'express';

export class AuthUtils {
  public static encrypt(data: string): string {
    if (!data) {
      return '';
    }

    return hashSync(data, 10);
  }

  public static compareSync(value: string, comparedHash: string): boolean {
    if (!value || !comparedHash) {
      return false;
    }

    return compareSync(value, comparedHash);
  }

  public static extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];

    return type === 'Bearer' ? token : undefined;
  }
}
