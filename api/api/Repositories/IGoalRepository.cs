public interface IGoalRepository
{
    Task<IEnumerable<Goal>> GetAllAsync(int offset, int limit);
    Task<int> GetTotalCountAsync();
}
