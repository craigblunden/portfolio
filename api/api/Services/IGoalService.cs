public interface IGoalService
{
    Task<PagedResponseDto<GoalResponseDto>> GetAllAsync(int offset, int limit);
}
