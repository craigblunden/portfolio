using Microsoft.EntityFrameworkCore;

public class TodoRepository : ITodoRepository
{
    private readonly AppDbContext _context;

    public TodoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Todo>> GetAllAsync(int offset, int limit) =>
        await _context.Todos.Skip(offset).Take(limit).ToListAsync();

    public async Task<Todo?> GetByIdAsync(int id) => await _context.Todos.FindAsync(id);

    public async Task AddAsync(Todo todo)
    {
        await _context.Todos.AddAsync(todo);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Todo todo)
    {
        _context.Todos.Update(todo);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(int id)
    {
        var todo = await _context.Todos.FindAsync(id);
        if (todo == null)
        {
            throw new EntityNotFoundException($"Todo with ID {id} was not found.");
        }

        _context.Todos.Remove(todo);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetTotalCountAsync() => await _context.Todos.CountAsync();
}
