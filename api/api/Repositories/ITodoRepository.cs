public interface ITodoRepository
{
    Task<IEnumerable<Todo>> GetAllAsync(int offset, int limit);
    Task<Todo?> GetByIdAsync(int id);
    Task AddAsync(Todo todo);
    Task UpdateAsync(Todo todo);
    Task RemoveAsync(int id);

    Task<int> GetTotalCountAsync();
}
