namespace api.Tests.Infrastructure;

/// <summary>
/// In-memory <see cref="IGoalRepository"/>. Preferred over a mock so service tests can
/// assert on resulting state rather than on which methods were called — the latter
/// breaks under refactoring even when behaviour is unchanged.
/// </summary>
public class FakeGoalRepository : IGoalRepository
{
    public List<Goal> Goals { get; } = [];

    public Task<IEnumerable<Goal>> GetAllAsync(int offset, int limit) =>
        Task.FromResult(Goals.Skip(offset).Take(limit).AsEnumerable());

    public Task AddAsync(Goal goal)
    {
        goal.Id = Goals.Count + 1;
        Goals.Add(goal);
        return Task.CompletedTask;
    }

    public Task<int> GetTotalCountAsync() => Task.FromResult(Goals.Count);

    public Task<bool> SlugExistsAsync(string slug) =>
        Task.FromResult(Goals.Any(g => g.Slug == slug));

    public Task DeleteAsync(int id)
    {
        var goal = Goals.FirstOrDefault(g => g.Id == id);
        if (goal == null)
        {
            throw new EntityNotFoundException($"Goal with ID {id} was not found.");
        }

        Goals.Remove(goal);
        return Task.CompletedTask;
    }
}
