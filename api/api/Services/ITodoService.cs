public interface ITodoService
{
    Task<PagedResponseDto<TodoResponseDto>> GetAllAsync(int offset, int limit);
    Task<TodoResponseDto?> GetByIdAsync(int id);
    Task<TodoResponseDto> CreateAsync(TodoRequestCreateDto dto);
    Task<TodoResponseDto?> UpdateAsync(int id, TodoRequestUpdateDto dto);
    Task DeleteAsync(int id);
}
