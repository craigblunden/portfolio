using Microsoft.EntityFrameworkCore;

public class GoalRepository : IGoalRepository
{
    private readonly AppDbContext _context;

    public GoalRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Goal>> GetAllAsync(int offset, int limit) =>
        await _context
            .Goals.AsNoTracking()
            .Include(g => g.Todos)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

    public async Task<int> GetTotalCountAsync() => await _context.Goals.CountAsync();
}
