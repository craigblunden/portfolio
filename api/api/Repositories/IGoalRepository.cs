public interface IGoalRepository
{
    Task<IEnumerable<Goal>> GetAllAsync(int offset, int limit);
    Task AddAsync(Goal goal);
    Task<int> GetTotalCountAsync();
    Task<bool> SlugExistsAsync(string slug);
}
