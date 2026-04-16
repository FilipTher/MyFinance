export class CreateGoalDto {
  name: string;
  categoryName: string;
  icon: string;
  targetAmount: number;
  savedAmount?: number;
}
