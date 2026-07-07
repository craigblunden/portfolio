public interface ITodoService
{
    Task<PagedResponseDto<TodoResponseDto>> GetAllAsync(int offset, int limit);
    Task<TodoResponseDto?> GetByIdAsync(int id);
    Task<TodoResponseDto> CreateAsync(TodoRequestCreateDto dto);
    Task DeleteAsync(int id);
}
