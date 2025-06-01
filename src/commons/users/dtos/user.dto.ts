export type UserDto = {
  name: string;
  email: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type userDataDto = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

export type LoginDtoData = {
  token: string;
  user: userDataDto;
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
} & UserBalanceDto;

export type UpdateUserDto = {
  password?: string;
} & UserFilterDto &
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
