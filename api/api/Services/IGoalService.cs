public interface IGoalService
{
    Task<PagedResponseDto<GoalResponseDto>> GetAllAsync(int offset, int limit);
    Task<GoalResponseDto> CreateAsync(GoalRequestCreateDto dto);
    Task DeleteAsync(int id);
}
