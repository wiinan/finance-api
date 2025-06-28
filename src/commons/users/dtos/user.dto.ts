export type UserDto = {
  name: string;
  email: string;
  password: string;
  isRoot?: boolean;
};

export type userDataDto = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

export type UserBalanceDto = {
  incomeBalance?: number;
  expenseBalance?: number;
  receivedBalance?: number;
};

export type UserFilterDto = {
  id?: number;
  name?: string;
  email?: string;
  isDeleted?: boolean;
  isRoot?: boolean;
  provider?: string;
  userId?: number;
} & UserBalanceDto;

export type UpdateUserDto = { password?: string } & UserFilterDto &
  UserBalanceDto;

export type WhereUserParamsDto = {
  parameters: UserFilterDto;
  query: string;
};

export type UserParamsDto = {
  id: number;
};

export type CronUserBalanceDataDto = {
  userId: number;
  typeId: number;
  hasUpdateBalance: boolean;
  liquidPrice?: number;
  receivedBalance?: number;
};
