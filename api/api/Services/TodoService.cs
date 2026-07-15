public class TodoService : ITodoService
{
    private readonly ITodoRepository _todoRepository;

    public TodoService(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    async Task ITodoService.DeleteAsync(int id)
    {
        await _todoRepository.RemoveAsync(id);
    }

    async Task<TodoResponseDto> ITodoService.CreateAsync(TodoRequestCreateDto dto)
    {
        var todo = new Todo { Title = dto.Title };
        await _todoRepository.AddAsync(todo);
        return ToResponse(todo);
    }

    async Task<PagedResponseDto<TodoResponseDto>> ITodoService.GetAllAsync(int offset, int limit)
    {
        var todos = await _todoRepository.GetAllAsync(offset, limit);
        var totalCount = await _todoRepository.GetTotalCountAsync();
        var pageNumber = offset / limit + 1;
        var totalPages = (int)Math.Ceiling(totalCount / (double)limit);

        return new PagedResponseDto<TodoResponseDto>(
            todos.Select(ToResponse),
            new PagedResponseMetaDto(totalPages, pageNumber < totalPages, pageNumber > 1)
        );
    }

    async Task<TodoResponseDto?> ITodoService.GetByIdAsync(int id)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        return todo is null ? null : ToResponse(todo);
    }

    private static TodoResponseDto ToResponse(Todo todo) =>
        new() { Id = todo.Id, Title = todo.Title, Status = todo.Status };
}
